// a1-data.js
// Wir initialisieren das Array, falls es noch nicht existiert (wichtig für Modularität)
window.courseData = window.courseData || [];

window.courseData.push({
    level: "A1",
    id: "a1-basics",
    title: "A1: Grundlagen & Aussprache",
    lessons: [
        {
            id: "a1-l1",
            title: "Begrüßung & Basiswissen",
            info: {
                grammar: "Im Kurmanci (Nordkurdisch) ist die Aussprache sehr regelmäßig. Es gibt jedoch ein paar Sonderzeichen, die du kennen musst.",
                pronunciation: [
                    { letter: "ç", desc: "wie 'tsch' in Tschüss (z.B. çawa)" },
                    { letter: "ş", desc: "wie 'sch' in Schule (z.B. şev)" },
                    { letter: "ê", desc: "langes 'e', fast wie 'ä' (z.B. erê)" },
                    { letter: "î", desc: "langes 'i' (z.B. sî)" },
                    { letter: "û", desc: "langes, tiefes 'u' (z.B. dûr)" }
                ]
            },
            questions: [
                {
                    type: "mc",
                    question: "Was bedeutet 'Hallo' auf Kurmanci?",
                    options: ["Spas", "Silav", "Rojbaş", "Erê"],
                    correctIndex: 1
                },
                {
                    type: "mc",
                    question: "Was heißt 'Guten Tag'?",
                    options: ["Şevbaş", "Rojbaş", "Çawa yî", "Na"],
                    correctIndex: 1
                },
                {
                    type: "translate",
                    question: "Übersetze: 'Wie geht es dir?'",
                    correctAnswers: ["Tu çawa yî?", "Tu çawa yî"], // Toleranz für Satzzeichen
                    hint: "Tu ç... yî?"
                }
            ]
        },
        {
            id: "a1-l2",
            title: "Ja, Nein & Danke",
            info: {
                grammar: "Kurze Antworten sind im Alltag extrem wichtig. 'Erê' (Ja) und 'Na' (Nein) bilden die Basis.",
                pronunciation: []
            },
            questions: [
                {
                    type: "mc",
                    question: "Was bedeutet 'Danke'?",
                    options: ["Spas", "Na", "Kerem ke", "Ew"],
                    correctIndex: 0
                }
            ]
        }
    ]
});
