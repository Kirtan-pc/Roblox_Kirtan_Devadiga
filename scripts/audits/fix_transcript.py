with open('D:\Roblox_Kirtan_Devadiga/backend/transcript_analysis.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add _normalize_whitespace static method after _normalize_case
content = content.replace(
    '    @staticmethod\n    def _normalize_case(text):',
    '    @staticmethod\n    def _normalize_case(text):\n\n    @staticmethod\n    def _normalize_whitespace(text: str) -> str:\n        return re.sub(r"\\s+", " ", text).strip()'
)

with open('D:\Roblox_Kirtan_Devadiga/backend/transcript_analysis.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added _normalize_whitespace method')