/**
 * ==============================================
 * MEKONG AGENCY - VIRTUAL EVENTS SYSTEM
 * AgencyOS Virtual Events Workflow
 * ==============================================
 */

// ===== EVENT BUS =====
class EventsBus {
    constructor() { this.listeners = new Map(); }
    on(event, cb) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event).push(cb);
    }
    emit(event, data) {
        if (this.listeners.has(event)) this.listeners.get(event).forEach(cb => cb(data));
    }
}

const eventsBus = new EventsBus();

// ===== EVENT TYPES =====
const EventTypes = {
    webinar: { id: 'webinar', name: 'Webinar', icon: 'videocam', defaultDuration: 60 },
    workshop: { id: 'workshop', name: 'Workshop', icon: 'groups', defaultDuration: 120 },
    conference: { id: 'conference', name: 'Conference', icon: 'stadium', defaultDuration: 180 }
};

// ===== EMAIL TEMPLATES =====
const EmailTemplates = {
    confirmation: {
        id: 'confirmation',
        timing: 'immediate',
        subject: '✅ Xác nhận đăng ký: {eventTitle}',
        preview: 'Cảm ơn bạn đã đăng ký...'
    },
    reminder1: {
        id: 'reminder1',
        timing: '24h before',
        subject: '⏰ Nhắc nhở: {eventTitle} diễn ra trong 24 giờ',
        preview: 'Sự kiện sắp diễn ra...'
    },
    reminder2: {
        id: 'reminder2',
        timing: '1h before',
        subject: '🔴 LIVE trong 1 giờ: {eventTitle}',
        preview: 'Chuẩn bị tham gia...'
    },
    followup: {
        id: 'followup',
        timing: '24h after',
        subject: '📹 Xem lại: {eventTitle}',
        preview: 'Cảm ơn bạn đã tham gia...'
    }
};

// ===== VIRTUAL EVENT =====
class VirtualEvent {
    constructor(config) {
        this.id = config.id || `event-${Date.now()}`;
        this.slug = this.generateSlug(config.title);
        this.title = config.title;
        this.description = config.description || '';
        this.type = config.type || 'webinar';
        this.date = config.date;
        this.time = config.time || '14:00';
        this.duration = config.duration || EventTypes[config.type]?.defaultDuration || 60;
        this.timezone = config.timezone || 'Asia/Ho_Chi_Minh';
        this.speakers = config.speakers || [];
        this.thumbnail = config.thumbnail || '';
        this.status = 'draft'; // draft, scheduled, live, ended
        this.streamUrl = config.streamUrl || '';
        this.streamPlatform = config.streamPlatform || 'zoom';
        this.recordingEnabled = config.recordingEnabled ?? true;
        this.chatEnabled = config.chatEnabled ?? true;
        this.registrations = [];
        this.attendees = [];
        this.emailSequence = Object.keys(EmailTemplates);
        this.createdAt = new Date().toISOString();
        this.publishedAt = null;
    }

    generateSlug(title) {
        return title.toLowerCase()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    addSpeaker(speaker) {
        this.speakers.push({
            id: `speaker-${Date.now()}`,
            name: speaker.name,
            title: speaker.title || '',
            bio: speaker.bio || '',
            avatar: speaker.avatar || ''
        });
        return this;
    }

    publish() {
        this.status = 'scheduled';
        this.publishedAt = new Date().toISOString();
        eventsBus.emit('event:published', { event: this });
        return this;
    }

    goLive() {
        this.status = 'live';
        this.liveStartedAt = new Date().toISOString();
        eventsBus.emit('event:live', { event: this });
        return this;
    }

    end() {
        this.status = 'ended';
        this.endedAt = new Date().toISOString();
        eventsBus.emit('event:ended', { event: this });
        return this;
    }

    getDateTime() {
        return new Date(`${this.date}T${this.time}:00`);
    }

    isUpcoming() {
        return this.getDateTime() > new Date();
    }

    getTimeUntil() {
        const diff = this.getDateTime() - new Date();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { days, hours, minutes, total: diff };
    }

    getMetrics() {
        const registered = this.registrations.length;
        const attended = this.attendees.length;
        return {
            registered,
            attended,
            attendanceRate: registered > 0 ? Math.round((attended / registered) * 100) : 0,
            conversionRate: registered > 0 ? Math.round((registered / (registered * 3)) * 100) : 33 // Simulated
        };
    }
}

// ===== REGISTRATION =====
class Registration {
    constructor(config) {
        this.id = config.id || `reg-${Date.now()}`;
        this.eventId = config.eventId;
        this.name = config.name;
        this.email = config.email;
        this.phone = config.phone || '';
        this.company = config.company || '';
        this.registeredAt = new Date().toISOString();
        this.attended = false;
        this.joinedAt = null;
        this.leftAt = null;
        this.emailsSent = [];
    }

    markAttended() {
        this.attended = true;
        this.joinedAt = new Date().toISOString();
        return this;
    }

    markLeft() {
        this.leftAt = new Date().toISOString();
        return this;
    }

    getWatchTime() {
        if (!this.joinedAt) return 0;
        const end = this.leftAt ? new Date(this.leftAt) : new Date();
        return Math.round((end - new Date(this.joinedAt)) / (1000 * 60));
    }
}

// ===== EVENTS MANAGER =====
class EventsManager {
    constructor() {
        this.events = new Map();
        this.registrations = new Map();
        this.emailQueue = [];
    }

    // ===== EVENT MANAGEMENT =====
    createEvent(config) {
        const event = new VirtualEvent(config);
        this.events.set(event.id, event);
        eventsBus.emit('event:created', { event });
        return event;
    }

    getEvent(id) {
        return this.events.get(id);
    }

    getEventBySlug(slug) {
        return Array.from(this.events.values()).find(e => e.slug === slug);
    }

    getAllEvents(status = null) {
        let events = Array.from(this.events.values());
        if (status) events = events.filter(e => e.status === status);
        return events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    publishEvent(eventId) {
        const event = this.getEvent(eventId);
        if (event) event.publish();
        return event;
    }

    startEvent(eventId) {
        const event = this.getEvent(eventId);
        if (event) {
            event.goLive();
            // Mark all registered as potential attendees
            event.registrations.forEach(r => {
                this.simulateAttendance(r);
            });
        }
        return event;
    }

    endEvent(eventId) {
        const event = this.getEvent(eventId);
        if (event) {
            event.end();
            this.scheduleFollowupEmails(event);
        }
        return event;
    }

    // ===== REGISTRATION =====
    register(eventId, attendeeData) {
        const event = this.getEvent(eventId);
        if (!event) return null;

        const registration = new Registration({
            eventId,
            ...attendeeData
        });

        this.registrations.set(registration.id, registration);
        event.registrations.push(registration);

        // Send confirmation email
        this.sendEmail(registration, 'confirmation', event);

        eventsBus.emit('registration:created', { registration, event });
        return registration;
    }

    getRegistration(id) {
        return this.registrations.get(id);
    }

    getEventRegistrations(eventId) {
        const event = this.getEvent(eventId);
        return event ? event.registrations : [];
    }

    simulateAttendance(registration) {
        // Simulate ~60% attendance
        if (Math.random() > 0.4) {
            registration.markAttended();
            const event = this.getEvent(registration.eventId);
            if (event) event.attendees.push(registration);
        }
    }

    // ===== EMAIL SYSTEM =====
    sendEmail(registration, templateId, event) {
        const template = EmailTemplates[templateId];
        if (!template) return null;

        const email = {
            id: `email-${Date.now()}`,
            registrationId: registration.id,
            to: registration.email,
            templateId,
            subject: template.subject.replace('{eventTitle}', event.title),
            sentAt: new Date().toISOString(),
            status: 'sent'
        };

        registration.emailsSent.push(email);
        this.emailQueue.push(email);

        eventsBus.emit('email:sent', { email, registration, event });
        return email;
    }

    scheduleReminderEmails(eventId) {
        const event = this.getEvent(eventId);
        if (!event) return;

        // Simulate scheduled reminders
        event.registrations.forEach(reg => {
            this.emailQueue.push({
                registrationId: reg.id,
                templateId: 'reminder1',
                scheduledFor: 'T-24h'
            });
            this.emailQueue.push({
                registrationId: reg.id,
                templateId: 'reminder2',
                scheduledFor: 'T-1h'
            });
        });

        eventsBus.emit('emails:scheduled', { eventId, count: event.registrations.length * 2 });
    }

    scheduleFollowupEmails(event) {
        event.registrations.forEach(reg => {
            setTimeout(() => {
                this.sendEmail(reg, 'followup', event);
            }, 2000); // Simulate delay
        });
    }

    // ===== METRICS =====
    getMetrics() {
        const events = this.getAllEvents();
        const totalEvents = events.length;
        const liveEvents = events.filter(e => e.status === 'live').length;
        const totalRegistrations = Array.from(this.registrations.values()).length;
        const totalAttendees = events.reduce((sum, e) => sum + e.attendees.length, 0);

        return {
            totalEvents,
            liveEvents,
            scheduledEvents: events.filter(e => e.status === 'scheduled').length,
            totalRegistrations,
            totalAttendees,
            avgAttendanceRate: totalRegistrations > 0
                ? Math.round((totalAttendees / totalRegistrations) * 100)
                : 0,
            emailsSent: this.emailQueue.filter(e => e.status === 'sent').length
        };
    }
}

// ===== DEMO DATA =====
function createDemoEvents(manager) {
    // Create demo event
    const event1 = manager.createEvent({
        title: 'Agency Automation Masterclass',
        description: 'Học cách tự động hóa quy trình agency để tăng hiệu suất 300%',
        type: 'webinar',
        date: '2026-02-01',
        time: '14:00',
        duration: 60,
        streamPlatform: 'zoom'
    });

    event1.addSpeaker({
        name: 'Nguyễn Văn A',
        title: 'CEO, Mekong Agency',
        bio: 'Chuyên gia Digital Marketing với 10+ năm kinh nghiệm'
    });

    event1.publish();

    // Add demo registrations
    const names = ['Trần Văn B', 'Lê Thị C', 'Phạm Văn D', 'Hoàng Thị E', 'Vũ Văn F'];
    names.forEach((name, i) => {
        manager.register(event1.id, {
            name,
            email: `${name.toLowerCase().replace(/\s/g, '')}@email.com`,
            phone: `090${1234567 + i}`
        });
    });

    // Create second event
    const event2 = manager.createEvent({
        title: 'Workshop: Xây dựng Funnel Marketing',
        description: 'Thực hành xây dựng funnel từ A-Z',
        type: 'workshop',
        date: '2026-02-15',
        time: '09:00',
        duration: 180
    });

    event2.addSpeaker({
        name: 'Trần Thị X',
        title: 'Marketing Director'
    });

    return [event1, event2];
}

// ===== FORMATTERS =====
function formatEventDate(date, time) {
    const d = new Date(`${date}T${time}:00`);
    return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m} phút`;
}

// ===== GLOBAL INSTANCE =====
const eventsManager = new EventsManager();

// ===== EXPORTS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EventsManager,
        VirtualEvent,
        Registration,
        EventTypes,
        EmailTemplates,
        eventsManager,
        eventsBus,
        createDemoEvents,
        formatEventDate,
        formatDuration
    };
}
