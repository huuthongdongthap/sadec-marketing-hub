#!/usr/bin/env node
/**
 * JSON Report Generator
 */

/**
 * Generate JSON report
 */
function generateJSONReport(results) {
    const score = calculateScore(results);

    return {
        timestamp: results.timestamp,
        filesScanned: results.filesScanned,
        healthScore: score,
        healthRating: getScoreRating(score),
        summary: {
            brokenLinks: results.links.broken.length,
            missingMetaTags: results.meta.missing.length,
            accessibilityIssues: results.a11y.issues.length,
            duplicateIDs: results.ids.duplicates.length,
            totalIssues:
                results.links.broken.length +
                results.meta.missing.length +
                results.a11y.issues.length +
                results.ids.duplicates.length
        },
        details: {
            links: results.links,
            meta: results.meta,
            a11y: results.a11y,
            ids: results.ids
        }
    };
}

function calculateScore(results) {
    const totalIssues =
        results.links.broken.length +
        results.meta.missing.length +
        results.a11y.issues.length +
        results.ids.duplicates.length;

    return Math.max(0, Math.min(100, 100 - (totalIssues * 2)));
}

function getScoreRating(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
}

module.exports = { generateJSONReport, calculateScore, getScoreRating };
