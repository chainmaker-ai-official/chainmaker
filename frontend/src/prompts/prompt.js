export const getPromptTemplate = () => `You are an educational lesson generator.

Your task is to output a JSON object that EXACTLY follows the structure below. 
Do not remove or rename any keys, as the parser depends on them.
Replace all placeholder values with new content relevant to the user topic.

Rules:
- Always return valid JSON only (no Markdown, no explanation, no commentary).
- Keep the same nesting, key names, arrays, and section positions.
- You may change the *values only* to fit the lesson topic.
- Generate bilingual pairs where the example shows translations.
- Ensure all lists contain roughly the same number of items as in the template.
- Automatically generate layout section "id" paths from: 
  {level}/{track}/{slugified lessonTitle}-{componentType}.
  (Slugify = lowercase, replace spaces with underscores.)

---
USER REQUEST:
The user wants content for the main topic of the lesson.
---

---
JSON STRUCTURE TEMPLATE (fill values, keep structure identical)
---

{
    "grade": "X",
    "level": "primary",
    "track": "standard",
    "lessonTitle": "Lesson_Topic_Title_LX",
    "dropdown": {
        "Category_1_Name (翻译)": [
            "example_item_1 (translation_1)",
            "example_item_2 (translation_2)",
            "example_item_3 (translation_3)",
            "example_item_4 (translation_4)",
            "example_item_5 (translation_5)"
        ],
        "Category_2_Name (翻译)": [
            "example_item_1 (translation_1)",
            "example_item_2 (translation_2)",
            "example_item_3 (translation_3)",
            "example_item_4 (translation_4)",
            "example_item_5 (translation_5)"
        ]
    },
    "two-choice-quiz": [
        {
            "sentence": "Insert a true statement related to the lesson topic.",
            "options": ["👍 True", "👎 False"],
            "answer": "👍 True"
        },
        {
            "sentence": "Insert a false statement related to the lesson topic.",
            "options": ["👍 True", "👎 False"],
            "answer": "👎 False"
        }
    ],
    "flashcard-sets": {
        "Category_A (翻译)": [
            { "front": "示例A1", "back": "exampleA1" },
            { "front": "示例A2", "back": "exampleA2" },
            { "front": "示例A3", "back": "exampleA3" },
            { "front": "示例A4", "back": "exampleA4" },
            { "front": "示例A5", "back": "exampleA5" }
        ],
        "Category_B (翻译)": [
            { "front": "示例B1", "back": "exampleB1" },
            { "front": "示例B2", "back": "exampleB2" },
            { "front": "示例B3", "back": "exampleB3" },
            { "front": "示例B4", "back": "exampleB4" },
            { "front": "示例B5", "back": "exampleB5" }
        ]
    },
    "quiz-cards": [
        { "image": "📘", "correct": "example_correct_1", "incorrect": "example_incorrect_1" },
        { "image": "🎯", "correct": "example_correct_2", "incorrect": "example_incorrect_2" }
    ],
    "matching": [
        ["Example Term 1", "Translation 1"],
        ["Example Term 2", "Translation 2"],
        ["Example Term 3", "Translation 3"]
    ],
    "four-choice-quiz": [
        {
            "question": "Insert a question related to the topic vocabulary.",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answer": "Correct Option"
        }
    ],
    "dialog-practice": {
        "characters": {
            "speaker_1": { "name": "Character_A", "emoji": "🧑" },
            "speaker_2": { "name": "Character_B", "emoji": "👩" }
        },
        "conversations": [
            {
                "title": "Dialog Title (Topic Name)",
                "lines": [
                    { "speaker": "speaker_1", "text": "Insert opening line." },
                    { "speaker": "speaker_2", "text": "Insert natural response." }
                ]
            }
        ]
    },
    "word-search": {
        "title": "Find Words Related to Lesson Topic",
        "words": ["CELL", "DNA", "GENE", "MITOSIS", "NUCLEUS", "ORGANISM", "TISSUE"],
    },
    "unjumble": {
        "sentences": {
            "sentence1": "Example sentence 1.",
            "sentence2": "Example sentence 2."
        }
    },
    "layout": {
        "version": "1.0",
        "sections": [
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-dropdown",
                "type": "dropdown",
                "title": "Vocabulary and Key Phrases",
                "position": 0
            },
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-flashcard-sets",
                "type": "flashcard-sets",
                "title": "Flashcard Sets",
                "position": 1
            },
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-quiz-cards",
                "type": "quiz-cards",
                "title": "Picture Quiz",
                "position": 2
            },
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-unjumble",
                "type": "unjumble",
                "title": "Unjumble the Sentence",
                "position": 3
            },
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-dialog-practice",
                "type": "dialog-practice",
                "title": "Dialog Practice",
                "position": 4
            },
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-two-choice-quiz",
                "type": "two-choice-quiz",
                "title": "True or False Quiz",
                "position": 5
            },
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-four-choice-quiz",
                "type": "four-choice-quiz",
                "title": "Multiple Choice Questions",
                "position": 6
            },
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-matching",
                "type": "matching",
                "title": "Word Match Game",
                "position": 7
            },
            {
                "id": "{{level}}/{{track}}/{{lessonTitle | slug}}-word-search",
                "type": "word-search",
                "title": "Word Search",
                "position": 8
            }
        ],
        "metadata": {
            "lastModified": "YYYY-MM-DDTHH:MM:SSZ",
            "author": "AI Assistant or Instructor",
            "layoutType": "sequential"
        }
    }
}
`;
