# Document Type Analysis Report

## Database Document Types (54 total)
1. admit_card
2. age_certificate
3. alumni_certificate
4. art_certificate
5. attendance_award
6. attendance_certificate
7. bonafide_certificate
8. book_receipt
9. bus_pass
10. character_certificate
11. club_membership
12. community_service
13. competition_certificate
14. computer_certificate
15. conduct_certificate
16. cultural_certificate
17. emergency_card
18. environmental_certificate
19. exam_schedule
20. excellence_certificate
21. exchange_certificate
22. fee_receipt
23. fee_waiver
24. graduation_certificate
25. health_card
26. id_card
27. innovation_certificate
28. invitation
29. language_certificate
30. leadership_certificate
31. leave_application
32. library_card
33. mark_sheet
34. medical_certificate
35. meeting_notice
36. migration_certificate
37. name_change
38. online_certificate
39. outstanding_award
40. participation_certificate
41. portfolio
42. progress_report
43. report_card
44. research_certificate
45. routine
46. safety_certificate
47. scholarship_certificate
48. science_fair
49. sports_certificate
50. staff_certificate
51. study_certificate
52. teacher_id
53. transcript
54. transfer_certificate

## Document Files in client/src/pages/documents/ (45 total)
1. admission-forms-mobile.tsx
2. admission-forms.tsx
3. class-routines-mobile.tsx
4. class-routines.tsx
5. document-generator.tsx
6. documents-dashboard-ux.tsx
7. exam-papers-enhanced.tsx
8. exam-papers.tsx
9. expense-sheets-mobile.tsx
10. expense-sheets.tsx
11. fee-receipts-mobile.tsx
12. fee-receipts-simple.tsx
13. fee-receipts.tsx
14. id-cards-create.tsx
15. id-cards-dashboard.tsx
16. id-cards-mobile.tsx
17. id-cards-simple.tsx
18. id-cards.tsx
19. income-reports-mobile.tsx
20. income-reports.tsx
21. marksheets-enhanced.tsx
22. marksheets-mobile.tsx
23. marksheets.tsx
24. mcq-formats.tsx
25. notices-mobile.tsx
26. notices.tsx
27. office-orders-mobile.tsx
28. office-orders.tsx
29. omr-sheets.tsx
30. pay-sheets-mobile.tsx
31. pay-sheets.tsx
32. paysheets.tsx
33. result-sheets-enhanced.tsx
34. result-sheets-mobile.tsx
35. result-sheets.tsx
36. teacher-id-cards-mobile.tsx
37. teacher-id-cards.tsx
38. teacher-routines-enhanced.tsx
39. teacher-routines-mobile.tsx
40. teacher-routines.tsx
41. templates.tsx
42. testimonials-enhanced.tsx
43. testimonials-mobile.tsx
44. testimonials.tsx
45. transfer-certificates.tsx

## Analysis Results

### DUPLICATES AND VARIATIONS FOUND:

#### 1. Fee Receipts (3 files)
- fee-receipts.tsx
- fee-receipts-mobile.tsx
- fee-receipts-simple.tsx
**Database type:** fee_receipt

#### 2. ID Cards (5 files)
- id-cards.tsx
- id-cards-mobile.tsx
- id-cards-simple.tsx
- id-cards-create.tsx
- id-cards-dashboard.tsx
**Database type:** id_card

#### 3. Marksheets (3 files)
- marksheets.tsx
- marksheets-mobile.tsx
- marksheets-enhanced.tsx
**Database type:** mark_sheet

#### 4. Result Sheets (3 files)
- result-sheets.tsx
- result-sheets-mobile.tsx
- result-sheets-enhanced.tsx
**Database type:** report_card

#### 5. Pay Sheets (3 files)
- pay-sheets.tsx
- pay-sheets-mobile.tsx
- paysheets.tsx (duplicate naming)
**Database type:** Not in database (unused)

#### 6. Teacher ID Cards (2 files)
- teacher-id-cards.tsx
- teacher-id-cards-mobile.tsx
**Database type:** teacher_id

#### 7. Class Routines (2 files)
- class-routines.tsx
- class-routines-mobile.tsx
**Database type:** routine

#### 8. Teacher Routines (3 files)
- teacher-routines.tsx
- teacher-routines-mobile.tsx
- teacher-routines-enhanced.tsx
**Database type:** routine

#### 9. Testimonials (3 files)
- testimonials.tsx
- testimonials-mobile.tsx
- testimonials-enhanced.tsx
**Database type:** character_certificate

#### 10. Exam Papers (2 files)
- exam-papers.tsx
- exam-papers-enhanced.tsx
**Database type:** exam_schedule

#### 11. Notices (2 files)
- notices.tsx
- notices-mobile.tsx
**Database type:** meeting_notice

#### 12. Office Orders (2 files)
- office-orders.tsx
- office-orders-mobile.tsx
**Database type:** Not in database (unused)

#### 13. Expense Sheets (2 files)
- expense-sheets.tsx
- expense-sheets-mobile.tsx
**Database type:** Not in database (unused)

#### 14. Income Reports (2 files)
- income-reports.tsx
- income-reports-mobile.tsx
**Database type:** Not in database (unused)

#### 15. Admission Forms (2 files)
- admission-forms.tsx
- admission-forms-mobile.tsx
**Database type:** Not in database (unused)

### UNUSED/ORPHANED FILES:
Files that don't correspond to any database document type:
1. pay-sheets.tsx / pay-sheets-mobile.tsx / paysheets.tsx
2. office-orders.tsx / office-orders-mobile.tsx
3. expense-sheets.tsx / expense-sheets-mobile.tsx
4. income-reports.tsx / income-reports-mobile.tsx
5. admission-forms.tsx / admission-forms-mobile.tsx
6. mcq-formats.tsx
7. omr-sheets.tsx

### MISSING COVERAGE:
Database document types with no corresponding files (46 types):
1. age_certificate
2. alumni_certificate
3. art_certificate
4. attendance_award
5. attendance_certificate
6. bonafide_certificate
7. book_receipt
8. bus_pass
9. club_membership
10. community_service
11. competition_certificate
12. computer_certificate
13. conduct_certificate
14. cultural_certificate
15. emergency_card
16. environmental_certificate
17. excellence_certificate
18. exchange_certificate
19. fee_waiver
20. graduation_certificate
21. health_card
22. innovation_certificate
23. invitation
24. language_certificate
25. leadership_certificate
26. leave_application
27. library_card
28. medical_certificate
29. migration_certificate
30. name_change
31. online_certificate
32. outstanding_award
33. participation_certificate
34. portfolio
35. progress_report
36. research_certificate
37. safety_certificate
38. scholarship_certificate
39. science_fair
40. sports_certificate
41. staff_certificate
42. study_certificate
43. transcript
44. transfer_certificate (only has transfer-certificates.tsx)
45. admit_card (covered by admit-card folder)

### RECOMMENDATIONS:

#### REMOVE DUPLICATES:
- Keep 1 main file per document type
- Remove mobile/simple/enhanced variations where they duplicate functionality
- Delete unused files that don't match database types

#### CONSOLIDATE:
- Use the dynamic document-generator.tsx for all 54 document types
- Remove specific document files since document-generator.tsx handles all types

#### FILES TO DELETE (32 files):
1. fee-receipts-mobile.tsx
2. fee-receipts-simple.tsx
3. id-cards-mobile.tsx
4. id-cards-simple.tsx
5. id-cards-create.tsx
6. id-cards-dashboard.tsx
7. marksheets-mobile.tsx
8. marksheets-enhanced.tsx
9. result-sheets-mobile.tsx
10. result-sheets-enhanced.tsx
11. pay-sheets.tsx
12. pay-sheets-mobile.tsx
13. paysheets.tsx
14. teacher-id-cards-mobile.tsx
15. class-routines-mobile.tsx
16. teacher-routines-mobile.tsx
17. teacher-routines-enhanced.tsx
18. testimonials-mobile.tsx
19. testimonials-enhanced.tsx
20. exam-papers-enhanced.tsx
21. notices-mobile.tsx
22. office-orders.tsx
23. office-orders-mobile.tsx
24. expense-sheets.tsx
25. expense-sheets-mobile.tsx
26. income-reports.tsx
27. income-reports-mobile.tsx
28. admission-forms.tsx
29. admission-forms-mobile.tsx
30. mcq-formats.tsx
31. omr-sheets.tsx
32. templates.tsx (redundant with documents-dashboard-ux.tsx)

#### FILES TO KEEP (13 files):
1. document-generator.tsx (handles all 54 types)
2. documents-dashboard-ux.tsx (main dashboard)
3. fee-receipts.tsx
4. id-cards.tsx
5. marksheets.tsx
6. result-sheets.tsx
7. teacher-id-cards.tsx
8. class-routines.tsx
9. teacher-routines.tsx
10. testimonials.tsx
11. exam-papers.tsx
12. notices.tsx
13. transfer-certificates.tsx

## FINAL STATUS:
- Total document files: 45
- Duplicate/unused files: 32 (71%)
- Essential files: 13 (29%)
- Database coverage: All 54 types handled by document-generator.tsx