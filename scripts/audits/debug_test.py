from backend.transcript_analysis import TranscriptAnalyzer, get_analyzer

analyzer = get_analyzer()

# Test the exact test case
analysis = analyzer.analyze("You are under digital arrest.")
print("Matched indicators:")
for i in analysis.matched_indicators:
    print(f"  category={i.category!r}, phrase={i.phrase!r}")

# Also check what the test expects
cat_names = set()
for i in analysis.matched_indicators:
    cat_names.add(i.category)
print(f"Categories found: {cat_names}")
has_da = "digital_arrest_threat" in cat_names
print(f"Has digital_arrest_threat: {has_da}")

# Test case insensitive
analysis2 = analyzer.analyze("DIGITAL ARREST is the term used.")
cat_names2 = set()
for i in analysis2.matched_indicators:
    cat_names2.add(i.category)
print(f"\nCase-insensitive test: categories found: {cat_names2}")

# Test punctuation
analysis3 = analyzer.analyze("Digital arrest!")
cat_names3 = set()
for i in analysis3.matched_indicators:
    cat_names3.add(i.category)
print(f"\nPunctuation test: categories found: {cat_names3}")

# Test whitespace
analysis4 = analyzer.analyze("Digital   arrest  threat")
cat_names4 = set()
for i in analysis4.matched_indicators:
    cat_names4.add(i.category)
print(f"\nWhitespace test: categories found: {cat_names4}")

# Test remote access
analysis5 = analyzer.analyze("Install AnyDesk for remote access.")
cat_names5 = set()
for i in analysis5.matched_indicators:
    cat_names5.add(i.category)
print(f"\nRemote access test: categories found: {cat_names5}")