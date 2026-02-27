import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/connect.js';
import { users, tutors, tutorSubjects, tutorTestAttempts, subjects, tutorDocuments } from '../db/schema.js';
import { sendTutorReviewEmail } from '../services/email.service.js';

/**
 * GET /api/admin/tutors
 * List all tutors (all statuses) with basic info.
 */
export async function getAllTutors(req, res) {
    try {
        const allTutors = await db
            .select({
                id: tutors.id,
                userId: users.id,
                name: users.name,
                email: users.email,
                education: tutors.education,
                experienceYears: tutors.experienceYears,
                city: tutors.city,
                status: tutors.status,
                createdAt: tutors.createdAt,
            })
            .from(tutors)
            .innerJoin(users, eq(tutors.userId, users.id))
            .orderBy(desc(tutors.createdAt));

        return res.status(200).json(allTutors);
    } catch (error) {
        console.error('Error fetching tutors:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * GET /api/admin/tutors/:id
 * Get full details of a tutor for review.
 */
export async function getTutorDetails(req, res) {
    const { id } = req.params;

    try {
        const [tutor] = await db
            .select()
            .from(tutors)
            .where(eq(tutors.id, id))
            .limit(1);

        if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

        const [user] = await db
            .select({
                name: users.name,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, tutor.userId))
            .limit(1);

        const tutorSubjs = await db
            .select({
                name: subjects.name,
                level: tutorSubjects.level,
            })
            .from(tutorSubjects)
            .innerJoin(subjects, eq(tutorSubjects.subjectId, subjects.id))
            .where(eq(tutorSubjects.tutorId, id));

        const testAttempts = await db
            .select()
            .from(tutorTestAttempts)
            .where(eq(tutorTestAttempts.tutorId, id))
            .orderBy(desc(tutorTestAttempts.attemptedAt));

        const documents = await db
            .select()
            .from(tutorDocuments)
            .where(eq(tutorDocuments.tutorId, id));

        return res.status(200).json({
            ...tutor,
            user,
            subjects: tutorSubjs,
            testAttempts,
            documents,
        });
    } catch (error) {
        console.error('Error fetching tutor details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * PATCH /api/admin/tutors/:id/review
 * Approve or reject a tutor.
 */
export async function reviewTutor(req, res) {
    const { id } = req.params;
    const { status, remarks } = req.body; // status: 'approved' | 'rejected' | 'suspended'

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be \'approved\', \'rejected\', or \'suspended\'.' });
    }

    try {
        const [existing] = await db
            .select({ id: tutors.id })
            .from(tutors)
            .where(eq(tutors.id, id))
            .limit(1);

        if (!existing) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        const [updated] = await db
            .update(tutors)
            .set({
                status,
                remarks: remarks || null,
            })
            .where(eq(tutors.id, id))
            .returning();

        const [tutorUser] = await db
            .select({ name: users.name, email: users.email })
            .from(users)
            .where(eq(users.id, updated.userId))
            .limit(1);

        if (tutorUser) {
            sendTutorReviewEmail(tutorUser.email, tutorUser.name, status, remarks).catch((err) =>
                console.error('[Admin] Failed to send tutor review email:', err.message)
            );
        }

        return res.status(200).json({
            message: `Tutor ${status} successfully`,
            tutor: updated,
        });
    } catch (error) {
        console.error('Error reviewing tutor:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}