/**
 * Mekong Agency Report Generator
 * Uses jsPDF to generate client success reports client-side
 */

// Import jsPDF from CDN (this will be available in the global scope)
// In a real build system, we would import it. For now, we assume it's loaded via script tag.
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

export class ReportGenerator {
    constructor() {
        this.doc = null;
    }

    async generateReport(data) {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF();

        const {
            clientName,
            period,
            metrics,
            insights,
            recommendations
        } = data;

        // Header
        this.addHeader(clientName, period);

        // Metrics Section
        this.addMetrics(metrics);

        // Charts Placeholder (Visual representation)
        this.addChartPlaceholder();

        // Insights & Recommendations
        this.addContent('Key Insights', insights, 140);
        this.addContent('Recommendations', recommendations, 200);

        // Footer
        this.addFooter();

        // Save PDF
        this.doc.save(`Mekong_Report_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    addHeader(clientName, period) {
        const doc = this.doc;

        // Brand Color Bar
        doc.setFillColor(0, 106, 96); // #006A60
        doc.rect(0, 0, 210, 20, 'F');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("MONTHLY PERFORMANCE REPORT", 15, 13);

        // Client Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(clientName, 15, 40);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: ${period}`, 15, 46);

        // Line
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 50, 195, 50);
    }

    addMetrics(metrics) {
        const doc = this.doc;
        let x = 15;
        let y = 70;

        const items = [
            { label: 'Impressions', value: metrics.impressions },
            { label: 'Clicks', value: metrics.clicks },
            { label: 'Conversions', value: metrics.conversions },
            { label: 'Spend (VND)', value: metrics.spend.toLocaleString('vi-VN') }
        ];

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Performance Overview", 15, 60);

        items.forEach((item, index) => {
            // Box
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(x, y, 40, 30, 2, 2, 'F');

            // Value
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 106, 96);
            doc.text(String(item.value), x + 20, y + 15, { align: 'center' });

            // Label
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(item.label, x + 20, y + 22, { align: 'center' });

            x += 45;
        });
    }

    addChartPlaceholder() {
        const doc = this.doc;

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Traffic Analysis", 15, 115);

        // Draw a simple bar chart representation
        doc.setDrawColor(220, 220, 220);
        doc.line(15, 135, 195, 135); // X-axis

        // Bars
        doc.setFillColor(0, 106, 96);
        doc.rect(25, 125, 10, 10, 'F');
        doc.rect(45, 120, 10, 15, 'F');
        doc.rect(65, 115, 10, 20, 'F');
        doc.rect(85, 118, 10, 17, 'F');
        doc.rect(105, 110, 10, 25, 'F');
    }

    addContent(title, content, yPos) {
        const doc = this.doc;

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 15, yPos);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        const splitText = doc.splitTextToSize(content, 180);
        doc.text(splitText, 15, yPos + 10);
    }

    addFooter() {
        const doc = this.doc;
        const pageHeight = doc.internal.pageSize.height;

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Mekong Agency - Advance Your Business", 105, pageHeight - 10, { align: 'center' });
    }
}

// Attach to window for easy access
window.ReportGenerator = ReportGenerator;
