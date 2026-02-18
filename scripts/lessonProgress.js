// scripts/lessonProgress.js – Shared lesson progress logic (uses dataSync)
(function() {
    const COURSE = window.DHECourse || 'html';
    const CHAPTER_ID = window.DHECurrentChapter;
    const LESSON_ID = window.DHECurrentLesson;
    const courseData = window.DHECourseData?.[COURSE];
    if (!courseData) {
        console.error('LessonProgress: Course data not found');
        return;
    }
    const currentChapter = courseData.chapters.find(ch => ch.id === CHAPTER_ID);
    if (!currentChapter) {
        console.error('LessonProgress: Chapter not found:', CHAPTER_ID);
        return;
    }
    const chapterLessonIds = currentChapter.lessons.map(l => l.id);
    const allLessonIds = courseData.chapters.flatMap(ch => ch.lessons.map(l => l.id));
    const CHAPTER_LESSONS = chapterLessonIds.length;
    const TOTAL_COURSE_LESSONS = allLessonIds.length;
    let currentProgress = {}; // in-memory cache

    // Update UI with current progress
    async function updateProgressUI() {
        try {
            currentProgress = await window.DHEDataSync.getProgress() || {};
        } catch (e) {
            console.warn('LessonProgress: Failed to get progress', e);
            currentProgress = {};
        }
        // Chapter progress
        let chapterCompletedCount = 0;
        chapterLessonIds.forEach(id => {
            if (currentProgress[id]) chapterCompletedCount++;
        });
        // Course progress
        let courseCompletedCount = 0;
        allLessonIds.forEach(id => {
            if (currentProgress[id]) courseCompletedCount++;
        });

        document.getElementById('chapterProgressText').textContent =
            `${chapterCompletedCount}/${CHAPTER_LESSONS}`;
        document.getElementById('chapterProgressFill').style.width =
            (chapterCompletedCount / CHAPTER_LESSONS) * 100 + '%';
        document.getElementById('courseProgressText').textContent =
            `${courseCompletedCount}/${TOTAL_COURSE_LESSONS}`;
        document.getElementById('courseProgressFill').style.width =
            (courseCompletedCount / TOTAL_COURSE_LESSONS) * 100 + '%';

        const btn = document.getElementById('markCompletedBtn');
        const isCompleted = currentProgress[LESSON_ID] || false;
        if (isCompleted) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
        if (window.DHEIndexTranslator) {
            const key = isCompleted ? 'progress.markIncomplete' : 'progress.markCompleted';
            const translation = window.DHEIndexTranslator.getTranslation(key);
            if (translation) btn.textContent = translation;
        }
    }

    async function toggleCompletion() {
        const newStatus = !currentProgress[LESSON_ID];
        currentProgress[LESSON_ID] = newStatus;
        try {
            await window.DHEDataSync.saveProgress(currentProgress);
            await updateProgressUI(); // refresh UI after save
            if (window.DHEIndexNotifications) {
                const status = newStatus ? 'completed' : 'marked incomplete';
                window.DHEIndexNotifications.instance.show(
                    'lesson-toggle', null, `Lesson ${status}.`, 'success'
                );
            }
        } catch (e) {
            console.warn('LessonProgress: Failed to save progress', e);
        }
    }

    function init() {
        const btn = document.getElementById('markCompletedBtn');
        if (btn) btn.addEventListener('click', toggleCompletion);
        updateProgressUI(); // async, but we don't need to await
        document.addEventListener('languageChanged', updateProgressUI);
        // Listen for data sync events (e.g., after sign‑in) to refresh UI
        document.addEventListener('dataSynced', updateProgressUI);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();