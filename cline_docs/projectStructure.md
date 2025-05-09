src
├── app
│   ├── (auth)
│   │   ├── confirm-password
│   │   │   └── page.tsx
│   │   ├── forgot-password
│   │   │   └── page.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── register
│   │   │   ├── components
│   │   │   │   ├── additional-details-form.tsx
│   │   │   │   ├── otp-input.tsx
│   │   │   │   ├── otp-verification-form.tsx
│   │   │   │   ├── parent-registration-form.tsx
│   │   │   │   ├── registration-complete.tsx
│   │   │   │   └── student-details-form.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page copy.tsx
│   │   │   ├── page.tsx
│   │   │   └── styles
│   │   │       └── animations.module.css
│   │   ├── registerOld
│   │   │   └── page.tsx
│   │   ├── reset-password
│   │   │   └── page.tsx
│   │   └── verify-otp
│   │       └── page.tsx
│   ├── (dashboard)
│   │   ├── admin
│   │   │   ├── dashboard
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── parent
│   │   │   ├── dashboard
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── student
│   │   │   ├── dashboard
│   │   │   │   ├── api
│   │   │   │   │   ├── dashboard-api.ts
│   │   │   │   │   └── progress-service.ts
│   │   │   │   ├── components
│   │   │   │   │   ├── course-cards.tsx
│   │   │   │   │   ├── dashboard-controller.tsx
│   │   │   │   │   ├── empty-state.tsx
│   │   │   │   │   ├── progress-overview-card.tsx
│   │   │   │   │   ├── recent-activity-card.tsx
│   │   │   │   │   ├── subject-card.tsx
│   │   │   │   │   ├── subject-progress-card.tsx
│   │   │   │   │   └── upcoming-assessments-card.tsx
│   │   │   │   ├── hooks
│   │   │   │   │   ├── use-assessment-data.ts
│   │   │   │   │   └── use-enrollment-data.ts
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   └── teacher
│   │       └── dashboard
│   │           └── page.tsx
│   ├── (pages)
│   │   └── manage
│   │       ├── account
│   │       │   └── page.tsx
│   │       ├── assessment-templates
│   │       │   ├── api
│   │       │   │   └── assessment-templates-api.ts
│   │       │   ├── components
│   │       │   │   ├── assessment-template-form.tsx
│   │       │   │   ├── assessment-templates-data-table.tsx
│   │       │   │   └── generate-assessment-dialog.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-assessment-templates.ts
│   │       │   │   └── use-classes-and-subjects.ts
│   │       │   └── page.tsx
│   │       ├── assessments-manage
│   │       │   ├── api
│   │       │   │   └── assessments-api.ts
│   │       │   ├── components
│   │       │   │   ├── assessment-form.tsx
│   │       │   │   ├── assessment-results-view.tsx
│   │       │   │   ├── assessments-data-table.tsx
│   │       │   │   └── question-assignment.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-assessments.ts
│   │       │   │   ├── use-classes.ts
│   │       │   │   ├── use-questions.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── assessments-management
│   │       │   ├── api
│   │       │   │   └── assessments-api.ts
│   │       │   ├── components
│   │       │   │   ├── assessment-data-table.tsx
│   │       │   │   ├── assessment-form.tsx
│   │       │   │   ├── assessment-results.tsx
│   │       │   │   └── question-selection.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-assessments.ts
│   │       │   │   ├── use-classes-subjects.ts
│   │       │   │   └── use-questions.ts
│   │       │   └── page.tsx
│   │       ├── attribute-types
│   │       │   ├── api
│   │       │   │   └── attribute-types-api.ts
│   │       │   ├── components
│   │       │   │   ├── attribute-type-form.tsx
│   │       │   │   └── attribute-types-data-table.tsx
│   │       │   ├── hooks
│   │       │   │   └── use-attribute-types.ts
│   │       │   └── page.tsx
│   │       ├── attributes
│   │       │   ├── api
│   │       │   │   └── attributes-api.ts
│   │       │   ├── components
│   │       │   │   ├── attribute-form.tsx
│   │       │   │   └── attributes-data-table.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-attribute-types-for-select.ts
│   │       │   │   └── use-attributes.ts
│   │       │   └── page.tsx
│   │       ├── chapters
│   │       │   ├── api
│   │       │   │   └── chapters-api.ts
│   │       │   ├── components
│   │       │   │   ├── chapter-form.tsx
│   │       │   │   ├── chapter-reordering-dialog.tsx
│   │       │   │   ├── chapters-data-table.tsx
│   │       │   │   └── lecture-management.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-chapters.ts
│   │       │   │   ├── use-classes.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── classes
│   │       │   ├── api
│   │       │   │   └── classes-api.ts
│   │       │   ├── components
│   │       │   │   ├── class-form.tsx
│   │       │   │   ├── classes-data-table.tsx
│   │       │   │   └── subject-assignment-dialog.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-classes.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── content-versions
│   │       │   ├── api
│   │       │   │   └── content-versions-api.ts
│   │       │   ├── components
│   │       │   │   ├── content-version-form.tsx
│   │       │   │   ├── content-versions-data-table.tsx
│   │       │   │   ├── version-assignment-form.tsx
│   │       │   │   ├── version-assignments-table.tsx
│   │       │   │   └── version-history-dialog.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-content-version-assignments.ts
│   │       │   │   ├── use-content-version-history.ts
│   │       │   │   ├── use-content-versions.ts
│   │       │   │   ├── use-students.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── dashboardUrooj
│   │       │   └── page.tsx
│   │       ├── dashboardUrooj19
│   │       │   └── page.tsx
│   │       ├── enrollments
│   │       │   ├── api
│   │       │   │   └── enrollments-api.ts
│   │       │   ├── components
│   │       │   │   ├── aptitude-test-form.tsx
│   │       │   │   ├── enrollment-form.tsx
│   │       │   │   ├── enrollments-data-table.tsx
│   │       │   │   └── pending-aptitude-tests.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-classes.ts
│   │       │   │   ├── use-enrollments.ts
│   │       │   │   ├── use-pending-aptitude-tests.ts
│   │       │   │   ├── use-student-enrollments.ts
│   │       │   │   ├── use-students.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── feature-flags
│   │       │   ├── api
│   │       │   │   └── feature-flags-api.ts
│   │       │   ├── components
│   │       │   │   ├── feature-flag-form.tsx
│   │       │   │   └── feature-flags-data-table.tsx
│   │       │   ├── hooks
│   │       │   │   └── use-feature-flags.ts
│   │       │   └── page.tsx
│   │       ├── guardian-student
│   │       │   ├── api
│   │       │   │   └── guardian-student-api.ts
│   │       │   ├── components
│   │       │   │   ├── guardian-student-data-table.tsx
│   │       │   │   └── guardian-student-form.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-guardian-student.ts
│   │       │   │   └── use-students-guardians.ts
│   │       │   └── page.tsx
│   │       ├── layout.tsx
│   │       ├── lectures
│   │       │   ├── api
│   │       │   │   └── lectures-api.ts
│   │       │   ├── components
│   │       │   │   ├── lecture-form.tsx
│   │       │   │   └── lectures-data-table.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-chapters.ts
│   │       │   │   ├── use-classes.ts
│   │       │   │   ├── use-lectures.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── manage-chapters2
│   │       │   ├── api
│   │       │   │   ├── chapters-api.ts
│   │       │   │   └── lectures-api.ts
│   │       │   ├── components
│   │       │   │   ├── chapter-form.tsx
│   │       │   │   ├── chapter-reorder.tsx
│   │       │   │   ├── chapters-data-table.tsx
│   │       │   │   └── lecture-assignment.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-chapters.ts
│   │       │   │   ├── use-classes.ts
│   │       │   │   ├── use-lectures.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── notifications
│   │       │   ├── api
│   │       │   │   └── notifications-api.ts
│   │       │   ├── components
│   │       │   │   ├── notification-form.tsx
│   │       │   │   ├── notification-template-form.tsx
│   │       │   │   ├── notification-templates-data-table.tsx
│   │       │   │   └── notifications-data-table.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-all-users.ts
│   │       │   │   ├── use-notification-templates.ts
│   │       │   │   └── use-notifications.ts
│   │       │   └── page.tsx
│   │       ├── questions
│   │       │   ├── api
│   │       │   │   └── questions-api.ts
│   │       │   ├── components
│   │       │   │   ├── question-form.tsx
│   │       │   │   └── questions-data-table.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-questions.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── settings
│   │       │   ├── api
│   │       │   │   ├── feature-flags-api.ts
│   │       │   │   └── settings-api.ts
│   │       │   ├── components
│   │       │   │   ├── feature-flag-form.tsx
│   │       │   │   ├── feature-flags-data-table.tsx
│   │       │   │   ├── setting-form.tsx
│   │       │   │   └── settings-data-table.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-feature-flags.ts
│   │       │   │   └── use-settings.ts
│   │       │   ├── page.tsx
│   │       │   └── types
│   │       │       ├── feature-flags.ts
│   │       │       └── settings.ts
│   │       ├── study-plans
│   │       │   ├── api
│   │       │   │   └── study-plans-api.ts
│   │       │   ├── components
│   │       │   │   ├── study-plan-form.tsx
│   │       │   │   ├── study-plans-data-table.tsx
│   │       │   │   └── study-session-form.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-students.ts
│   │       │   │   ├── use-study-plans.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       ├── subjects
│   │       │   ├── [id]
│   │       │   │   └── chapters
│   │       │   │       ├── components
│   │       │   │       │   ├── chapter-assignment-table.tsx
│   │       │   │       │   └── chapter-form.tsx
│   │       │   │       ├── hooks
│   │       │   │       │   └── use-chapters.ts
│   │       │   │       └── page.tsx
│   │       │   ├── api
│   │       │   │   └── subjects-api.ts
│   │       │   ├── components
│   │       │   │   ├── subject-form.tsx
│   │       │   │   ├── subjects-card-view.tsx
│   │       │   │   └── subjects-data-table.tsx
│   │       │   ├── hooks
│   │       │   │   ├── use-classes.ts
│   │       │   │   ├── use-subject.ts
│   │       │   │   └── use-subjects.ts
│   │       │   └── page.tsx
│   │       └── users
│   │           ├── api
│   │           │   └── users-api.ts
│   │           ├── components
│   │           │   ├── user-form.tsx
│   │           │   └── users-data-table.tsx
│   │           ├── hooks
│   │           │   ├── use-roles.ts
│   │           │   └── use-users.ts
│   │           ├── page copy.tsx
│   │           └── page.tsx
│   ├── (parent)
│   │   ├── add-student
│   │   │   └── page.tsx
│   │   ├── children
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── registration-success
│   │       └── page.tsx
│   ├── (student)
│   │   ├── api
│   │   │   └── aptitude-test-api.ts
│   │   ├── chapters
│   │   │   └── [chapterId]
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── lectures
│   │   │   ├── InteractiveContent.tsx
│   │   │   ├── LectureContent.tsx
│   │   │   ├── LectureHeader.tsx
│   │   │   ├── LectureSidebar.tsx
│   │   │   ├── PDFViewer.tsx
│   │   │   ├── SlideContent.tsx
│   │   │   ├── TextContent.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── api
│   │   │   │   ├── lecture-service.ts
│   │   │   │   └── notes-service.ts
│   │   │   ├── components
│   │   │   │   ├── NotesPanel.tsx
│   │   │   │   ├── PdfViewer.tsx
│   │   │   │   ├── TranscriptViewer.tsx
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   ├── lecture-navigator.tsx
│   │   │   │   ├── lecture-notes.tsx
│   │   │   │   └── lecture-transcript.tsx
│   │   │   └── utils
│   │   │       └── LectureViewUtils.ts
│   │   ├── subjects
│   │   │   ├── [subjectId]
│   │   │   │   ├── components
│   │   │   │   │   ├── chapter-list.tsx
│   │   │   │   │   ├── latest-performance.tsx
│   │   │   │   │   ├── progress-chart.tsx
│   │   │   │   │   └── subject-header.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── types.ts
│   │   │   ├── components
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── subject-access-gate.tsx
│   │   │   │   ├── subject-card.tsx
│   │   │   │   └── subject-list-item.tsx
│   │   │   ├── hooks
│   │   │   │   ├── use-enrollments.ts
│   │   │   │   ├── use-student-progress.ts
│   │   │   │   └── use-subject-access.ts
│   │   │   └── page.tsx
│   │   └── subjects-roo
│   │       └── page.tsx
│   ├── README.md
│   ├── aptitude-test
│   │   ├── api
│   │   │   └── assessment-api.ts
│   │   ├── components
│   │   │   ├── aptitude-test.tsx
│   │   │   ├── assign-aptitude-test.tsx
│   │   │   ├── test-intro.tsx
│   │   │   └── test-results.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── icon.ico
│   ├── layout.tsx
│   ├── opengraph-image.png
│   ├── page.tsx
│   ├── payment
│   │   └── page.tsx
│   └── twitter-image.png
├── components
│   ├── CampaignEarningsChart.tsx
│   ├── CampaignOrder.tsx
│   ├── CampaignPerformanceChart.tsx
│   ├── CampaignStatistics.tsx
│   ├── CampaignTopCharts.tsx
│   ├── CampaignWithdrawEarnings.tsx
│   ├── DataTableColumnHeader.tsx
│   ├── DataTablePagination.tsx
│   ├── DateTimePicker.tsx
│   ├── GlobalSearch.tsx
│   ├── InDataTable.tsx
│   ├── InfluencerTopCharts.tsx
│   ├── admin-panel
│   │   ├── admin-panel-layout.tsx
│   │   ├── admin-panel-other-layout.tsx
│   │   ├── collapse-menu-button.tsx
│   │   ├── content-layout.tsx
│   │   ├── content-other-layout.tsx
│   │   ├── footer.tsx
│   │   ├── menu.tsx
│   │   ├── navbar.tsx
│   │   ├── other-navbar.tsx
│   │   ├── sheet-menu.tsx
│   │   ├── sidebar-toggle.tsx
│   │   ├── sidebar.tsx
│   │   └── user-nav.tsx
│   ├── admin-panel-parent
│   │   ├── admin-panel-layout.tsx
│   │   ├── collapse-menu-button.tsx
│   │   ├── content-layout.tsx
│   │   ├── footer.tsx
│   │   ├── menu.tsx
│   │   ├── navbar.tsx
│   │   ├── sheet-menu.tsx
│   │   ├── sidebar-toggle.tsx
│   │   ├── sidebar.tsx
│   │   └── user-nav.tsx
│   ├── api-debug.tsx
│   ├── aptitude-test-question.tsx
│   ├── auth-side.tsx
│   ├── confirm-password-form.tsx
│   ├── dashboard-area-chart.tsx
│   ├── dashboard-bar-chart.tsx
│   ├── dashboard-horizontal-bar-chart.tsx
│   ├── dashboard-pie-chart.tsx
│   ├── dashboard-recent.tsx
│   ├── dashboard-single-card.tsx
│   ├── date-picker.tsx
│   ├── demo
│   │   └── placeholder-content.tsx
│   ├── error-boundary.tsx
│   ├── file-upload.tsx
│   ├── forgot-password-form.tsx
│   ├── icons.ts
│   ├── loading-button-new.tsx
│   ├── loading-button.tsx
│   ├── login-form.tsx
│   ├── logo-symbol.tsx
│   ├── logo-text.tsx
│   ├── mode-toggle.tsx
│   ├── otp-verification-form.tsx
│   ├── parent-dashboard
│   │   ├── assessment-results.tsx
│   │   ├── child-progress-card.tsx
│   │   ├── children-overview.tsx
│   │   ├── parent-navbar.tsx
│   │   ├── parent-sidebar.tsx
│   │   ├── parent-user-nav.tsx
│   │   ├── study-time-chart.tsx
│   │   └── upcoming-assessments.tsx
│   ├── parent-registration-form.tsx
│   ├── prealoader.tsx
│   ├── protected-layout.tsx
│   ├── providers
│   │   └── theme-provider.tsx
│   ├── reset-password-form.tsx
│   ├── student-dashboard
│   │   ├── student-achievements.tsx
│   │   ├── student-activity-chart.tsx
│   │   ├── student-course-progress.tsx
│   │   ├── student-navbar.tsx
│   │   ├── student-sidebar.tsx
│   │   ├── student-upcoming-assessments.tsx
│   │   └── subjects
│   │       ├── SubjectCard.tsx
│   │       ├── SubjectGrid.tsx
│   │       └── SubjectToolbar.tsx
│   ├── student-panel
│   │   └── content-layout.tsx
│   ├── student-registration-form.tsx
│   ├── tag-input.tsx
│   ├── tags-input.tsx
│   ├── ui
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── extension
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   └── tooltip.tsx
│   └── use-toast.ts
├── contexts
│   └── AuthContext.tsx
├── hooks
│   ├── use-attributes.ts
│   ├── use-auth.tsx
│   ├── use-classes.ts
│   ├── use-file-upload.ts
│   ├── use-mobile.tsx
│   ├── use-sidebar.ts
│   ├── use-store.ts
│   └── use-toast.ts
├── lib
│   ├── api-client-debug.ts
│   ├── api-client.ts
│   ├── auth-api.ts
│   ├── cookies.ts
│   ├── enrollment-api.ts
│   ├── image-utils.ts
│   ├── menu-list.ts
│   ├── mock-data-provider.ts
│   ├── mock-data.ts
│   ├── profile-api.ts
│   ├── schemas
│   │   ├── campaign.ts
│   │   └── form.ts
│   ├── schemas.ts
│   ├── utils.ts
│   └── validations
│       ├── auth.ts
│       └── register.ts
├── middleware
│   └── aptitude-test-middleware.ts
├── middleware-parent-verification.ts
├── middleware-student-aptitude.ts
├── middleware.ts
└── types
    └── index.ts

150 directories, 418 files