/**
 * ==============================================
 * MEKONG AGENCY - LMS (Learning Management System)
 * AgencyOS Education Workflow - Training & Courses
 * ==============================================
 */

const CourseCategories = {
    marketing: { id: 'marketing', name: 'Digital Marketing', icon: '📈' },
    social: { id: 'social', name: 'Social Media', icon: '📱' },
    content: { id: 'content', name: 'Content Creation', icon: '✍️' },
    analytics: { id: 'analytics', name: 'Analytics', icon: '📊' },
    tools: { id: 'tools', name: 'Tool Training', icon: '🛠️' }
};

const LessonTypes = {
    video: { id: 'video', name: 'Video', icon: '🎬' },
    article: { id: 'article', name: 'Article', icon: '📄' },
    quiz: { id: 'quiz', name: 'Quiz', icon: '❓' },
    assignment: { id: 'assignment', name: 'Assignment', icon: '📝' }
};

class Course {
    constructor(config) {
        this.id = config.id || `course-${Date.now()}`;
        this.title = config.title;
        this.description = config.description || '';
        this.category = config.category || 'marketing';
        this.instructor = config.instructor || 'Mekong Team';
        this.thumbnail = config.thumbnail || '';
        this.duration = config.duration || 0;
        this.lessons = [];
        this.price = config.price || 0;
        this.status = 'draft'; // draft, published, archived
        this.enrollments = 0;
        this.rating = 0;
        this.createdAt = new Date().toISOString();
    }

    addLesson(lesson) {
        lesson.order = this.lessons.length + 1;
        this.lessons.push(lesson);
        this.duration = this.lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
        return this;
    }

    publish() { this.status = 'published'; this.publishedAt = new Date().toISOString(); return this; }
    archive() { this.status = 'archived'; return this; }

    getTotalLessons() { return this.lessons.length; }
    getCompletionRate(studentProgress) {
        if (!studentProgress || this.lessons.length === 0) return 0;
        return Math.round((studentProgress.completedLessons.length / this.lessons.length) * 100);
    }
}

class Lesson {
    constructor(config) {
        this.id = config.id || `lesson-${Date.now()}`;
        this.title = config.title;
        this.type = config.type || 'video';
        this.content = config.content || '';
        this.duration = config.duration || 0;
        this.order = config.order || 0;
    }
}

class Student {
    constructor(config) {
        this.id = config.id || `student-${Date.now()}`;
        this.name = config.name;
        this.email = config.email;
        this.enrolledCourses = [];
        this.progress = new Map();
        this.certificates = [];
        this.createdAt = new Date().toISOString();
    }

    enroll(courseId) {
        if (!this.enrolledCourses.includes(courseId)) {
            this.enrolledCourses.push(courseId);
            this.progress.set(courseId, { completedLessons: [], startedAt: new Date().toISOString() });
        }
        return this;
    }

    completeLesson(courseId, lessonId) {
        const prog = this.progress.get(courseId);
        if (prog && !prog.completedLessons.includes(lessonId)) {
            prog.completedLessons.push(lessonId);
        }
        return this;
    }

    getCourseProgress(courseId) {
        return this.progress.get(courseId) || { completedLessons: [] };
    }
}

class LMSManager {
    constructor() {
        this.courses = new Map();
        this.students = new Map();
    }

    createCourse(config) {
        const course = new Course(config);
        this.courses.set(course.id, course);
        return course;
    }

    registerStudent(config) {
        const student = new Student(config);
        this.students.set(student.id, student);
        return student;
    }

    getCourse(id) { return this.courses.get(id); }
    getStudent(id) { return this.students.get(id); }
    getAllCourses() { return Array.from(this.courses.values()); }
    getAllStudents() { return Array.from(this.students.values()); }

    getPublishedCourses() {
        return this.getAllCourses().filter(c => c.status === 'published');
    }

    getMetrics() {
        const courses = this.getAllCourses();
        const students = this.getAllStudents();
        return {
            totalCourses: courses.length,
            publishedCourses: courses.filter(c => c.status === 'published').length,
            totalStudents: students.length,
            totalEnrollments: students.reduce((sum, s) => sum + s.enrolledCourses.length, 0),
            avgRating: courses.length > 0 ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1) : 0
        };
    }
}

function createDemoLMS(manager) {
    // Create courses
    const course1 = manager.createCourse({
        title: 'Facebook Ads Mastery',
        description: 'Learn to create high-converting Facebook campaigns',
        category: 'social',
        instructor: 'Marketing Team',
        price: 1500000
    });
    course1.addLesson({ title: 'Introduction to Facebook Ads', type: 'video', duration: 15 });
    course1.addLesson({ title: 'Setting Up Your First Campaign', type: 'video', duration: 25 });
    course1.addLesson({ title: 'Targeting Strategies', type: 'article', duration: 10 });
    course1.addLesson({ title: 'Quiz: Campaign Basics', type: 'quiz', duration: 5 });
    course1.publish();
    course1.rating = 4.8;
    course1.enrollments = 45;

    const course2 = manager.createCourse({
        title: 'Google Analytics 4',
        description: 'Master GA4 for data-driven decisions',
        category: 'analytics',
        price: 1200000
    });
    course2.addLesson({ title: 'GA4 Overview', type: 'video', duration: 20 });
    course2.addLesson({ title: 'Setting Up Events', type: 'video', duration: 30 });
    course2.publish();
    course2.rating = 4.5;
    course2.enrollments = 32;

    manager.createCourse({
        title: 'Content Marketing Strategy',
        description: 'Build a content strategy that converts',
        category: 'content',
        price: 0
    });

    // Create students
    const s1 = manager.registerStudent({ name: 'Nguyễn Văn A', email: 'a@client.com' });
    s1.enroll(course1.id);
    s1.completeLesson(course1.id, course1.lessons[0].id);
    s1.completeLesson(course1.id, course1.lessons[1].id);

    const s2 = manager.registerStudent({ name: 'Trần Thị B', email: 'b@client.com' });
    s2.enroll(course1.id);
    s2.enroll(course2.id);

    return manager;
}

const lmsManager = new LMSManager();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LMSManager, Course, Lesson, Student, CourseCategories, LessonTypes, lmsManager, createDemoLMS };
}
