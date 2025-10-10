# Demo CSVs

**Files**
- programs.csv — program code, name, degree type, catalog year
- courses.csv — subject, number, title, credits, CIP, TCCNS, optional coreArea
- termplan.csv — programCode, term (1..N), subject, number, required (true/false)
- outcomes.csv — type (PLO|CLO), ownerCode (program code for PLO; 'SUBJ NUM' for CLO), code, level (I|D|M), description
- alignments.csv — programCode, ploCode, courseSubject, courseNumber, cloCode, level, weight

**Notes**
- This dataset is designed to PASS the included Texas demo RulePack.
- Replace with your institution's real data or augment as needed.