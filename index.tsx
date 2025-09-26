import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- DATA: Questions configuration ---
const questions = [
    // Part 1
    { id: 'date', text: 'ما هو التاريخ اليوم؟', type: 'date', section: 'الوعي والاتصال الروحي' },
    { id: 'prayer', text: 'هل صليت اليوم؟', type: 'yes_no', section: 'الوعي والاتصال الروحي' },
    { id: 'quran_dua', text: 'هل خصصت وقتاً للورد القرآني أو الدعاء؟', type: 'yes_no', section: 'الوعي والاتصال الروحي' },
    // Part 2
    { id: 'gratitude', text: 'اذكر 3 أشياء تشعر بالامتنان لها اليوم.', type: 'multi_text', numEntries: 3, section: 'الامتنان' },
    // Part 3
    { id: 'fears', text: 'اذكر 3 مخاوف راودتك اليوم.', type: 'multi_text', numEntries: 3, section: 'المخاوف' },
    // Part 4
    { id: 'resentments', text: 'اذكر 3 أمور أزعجتك أو سببت لك استياء اليوم.', type: 'multi_text', numEntries: 3, section: 'الاستياءات' },
    // Part 5
    { id: 'affirmations', text: 'اكتب 5 عبارات توكيدية إيجابية تقولها لنفسك.', type: 'multi_text', numEntries: 5, section: 'التوكيدات' },
    // Part 6
    { id: 'istighfar', text: 'هل استغفرت اليوم؟', type: 'yes_no', section: 'الاستغفار' },
    // Part 7
    { id: 'craving', text: 'هل شعرت برغبة إدمانية قوية اليوم؟', type: 'multiple_choice', options: ['نعم بشدة', 'نعم قليلاً', 'لا'], section: 'الانتكاس والحالة النفسية' },
    { id: 'negative_feelings', text: 'هل واجهت مشاعر سلبية؟', type: 'yes_no', section: 'الانتكاس والحالة النفسية' },
    { id: 'destructive_behavior', text: 'هل لجأت لسلوك مدمر أو هروبي؟', type: 'yes_no', section: 'الانتكاس والحالة النفسية' },
    { id: 'rationality', text: 'هل تعاملت بعقلانية مع المواقف اليومية؟', type: 'yes_no', section: 'الانتكاس والحالة النفسية' },
    // Part 8
    { id: 'exercise', text: 'هل مارست الرياضة اليوم؟', type: 'yes_no', section: 'الممارسات الإيجابية' },
    { id: 'healthy_food', text: 'هل تناولت طعاماً صحياً؟', type: 'yes_no', section: 'الممارسات الإيجابية' },
    { id: 'express_feelings', text: 'هل عبرت عن مشاعرك بالكتابة أو التأمل؟', type: 'yes_no', section: 'الممارسات الإيجابية' },
    { id: 'help_others', text: 'هل ساعدت شخصاً آخر اليوم؟', type: 'yes_no', section: 'الممارسات الإيجابية' },
    { id: 'support_network', text: 'هل تواصلت مع شبكة دعمك؟', type: 'yes_no', section: 'الممارسات الإيجابية' },
    // Part 9
    { id: 'healthy_identity', text: 'هل عززت هويتك بشكل صحي اليوم؟', type: 'yes_no', section: 'الهوية والتوازن' },
    { id: 'rational_impulse', text: 'هل كان هناك موقف فيه اندفاع وتصرفت بعقلانية؟', type: 'yes_no', section: 'الهوية والتوازن' },
];

const App = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fade, setFade] = useState(true);

    const handleAnswer = (id, answer) => {
        setFade(false);
        setTimeout(() => {
            const newAnswers = { ...answers, [id]: answer };
            setAnswers(newAnswers);
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                setIsCompleted(true);
            }
            setFade(true);
        }, 300);
    };

    const calculateScoreAndGenerateAdvice = async () => {
        setIsLoading(true);
        let positivePoints = 0;
        const scorableQuestions = 16;

        if (answers.prayer === 'نعم') positivePoints++;
        if (answers.quran_dua === 'نعم') positivePoints++;
        if (answers.istighfar === 'نعم') positivePoints++;
        if (answers.rationality === 'نعم') positivePoints++;
        if (answers.exercise === 'نعم') positivePoints++;
        if (answers.healthy_food === 'نعم') positivePoints++;
        if (answers.express_feelings === 'نعم') positivePoints++;
        if (answers.help_others === 'نعم') positivePoints++;
        if (answers.support_network === 'نعم') positivePoints++;
        if (answers.healthy_identity === 'نعم') positivePoints++;
        if (answers.rational_impulse === 'نعم') positivePoints++;
        
        if (answers.craving === 'لا') positivePoints += 2;
        if (answers.craving === 'نعم قليلاً') positivePoints++;
        
        if (answers.negative_feelings === 'لا') positivePoints++;
        if (answers.destructive_behavior === 'لا') positivePoints++;
        
        // Acknowledging effort for writing is a positive step
        if (answers.gratitude?.some(g => g.trim() !== '')) positivePoints++;
        if (answers.affirmations?.some(a => a.trim() !== '')) positivePoints++;

        const finalScore = Math.min(10, (positivePoints / scorableQuestions) * 10);
        setScore(finalScore);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `أنت مساعد تعافي داعم ومشجع. بناءً على الجرد اليومي للمستخدم، قدم نصيحة قصيرة وعملية ومشجعة للغد. اجعل النصيحة باللغة العربية، أقل من 30 كلمة، وركز على نقطة أو اثنتين للتحسين أو التعزيز. إليك إجابات المستخدم:\n${JSON.stringify(answers, null, 2)}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAdvice(response.text);
        } catch (error) {
            console.error("Error generating advice:", error);
            setAdvice("خطأ في إنشاء النصيحة. حاول التركيز على الإيجابيات التي ذكرتها اليوم والمضي قدمًا غدًا!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isCompleted) {
            calculateScoreAndGenerateAdvice();
        }
    }, [isCompleted]);

    const restart = () => {
        setFade(false);
        setTimeout(() => {
            setCurrentQuestionIndex(0);
            setAnswers({});
            setIsCompleted(false);
            setScore(0);
            setAdvice('');
            setFade(true);
        }, 300);
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = (currentQuestionIndex / questions.length) * 100;

    const renderInput = () => {
        const [multiTextValues, setMultiTextValues] = useState(Array(currentQuestion.numEntries || 0).fill(''));
        const [error, setError] = useState('');

        const handleMultiTextChange = (index, value) => {
            const newValues = [...multiTextValues];
            newValues[index] = value;
            setMultiTextValues(newValues);
        };
        
        const handleMultiTextSubmit = (e) => {
            e.preventDefault();
            if (multiTextValues.some(val => val.trim() === '')) {
                setError('الرجاء تعبئة جميع الخانات.');
                return;
            }
            setError('');
            handleAnswer(currentQuestion.id, multiTextValues);
        }

        switch (currentQuestion.type) {
            case 'date':
                return <input style={styles.input} type="date" onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)} required />;
            case 'yes_no':
            case 'multiple_choice':
                return (
                    <div style={styles.buttonGroup}>
                        {(currentQuestion.options || ['نعم', 'لا']).map(option => (
                            <button key={option} style={styles.button} onClick={() => handleAnswer(currentQuestion.id, option)}>{option}</button>
                        ))}
                    </div>
                );
            case 'multi_text':
                return (
                    <form onSubmit={handleMultiTextSubmit}>
                        {multiTextValues.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                style={styles.input}
                                value={value}
                                onChange={(e) => handleMultiTextChange(index, e.target.value)}
                                placeholder={`الإجابة ${index + 1}`}
                                aria-label={`الإجابة ${index + 1}`}
                            />
                        ))}
                        {error && <p style={styles.error}>{error}</p>}
                        <button type="submit" style={styles.button}>التالي</button>
                    </form>
                )
            default:
                return null;
        }
    };

    return (
        <main style={{...styles.container, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(20px)'}}>
            {!isCompleted ? (
                <>
                    <header style={styles.header}>
                        <h1>الجرد اليومي للتعافي</h1>
                        <p style={styles.sectionTitle}>{currentQuestion.section}</p>
                    </header>
                    <div style={styles.progressBarContainer}>
                        <div style={{...styles.progressBar, width: `${progress}%`}}></div>
                    </div>
                    <section style={styles.questionBox} aria-live="polite">
                        <label style={styles.questionText} htmlFor={currentQuestion.id}>{currentQuestion.text}</label>
                        <div id={currentQuestion.id} style={styles.inputContainer}>
                            {renderInput()}
                        </div>
                    </section>
                </>
            ) : (
                <section style={styles.resultsCard} aria-live="polite">
                    <h2>انتهى الجرد اليومي!</h2>
                    <p>أحسنت على إكمالك لجردك اليوم. هذه خطوة مهمة في رحلة تعافيك.</p>
                    {isLoading ? (
                        <div style={styles.loader}></div>
                    ) : (
                        <>
                            <div style={styles.scoreContainer}>
                                <p style={styles.scoreLabel}>تقييم يومك</p>
                                <p style={styles.scoreValue}>{score.toFixed(1)}<span style={styles.scoreTotal}>/10</span></p>
                            </div>
                            <div style={styles.adviceContainer}>
                                <p style={styles.adviceLabel}>نصيحة للغد</p>
                                <p style={styles.adviceText}>"{advice}"</p>
                            </div>
                        </>
                    )}
                    <button style={styles.button} onClick={restart}>ابدأ من جديد</button>
                </section>
            )}
        </main>
    );
};

// --- STYLES ---
const styles = {
    container: {
        background: 'var(--card-bg-color)',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        boxShadow: '0 8px 30px var(--shadow-color)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
    },
    header: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem',
    },
    sectionTitle: {
        color: 'var(--primary-color)',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        margin: '0.5rem 0 0 0',
    },
    progressBarContainer: {
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '2rem',
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'var(--secondary-color)',
        transition: 'width 0.3s ease-in-out',
    },
    questionBox: {
        textAlign: 'center',
    },
    questionText: {
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
        lineHeight: '1.6',
        display: 'block',
    },
    inputContainer: {
        marginTop: '1rem',
    },
    input: {
        width: '100%',
        padding: '0.8rem 1rem',
        fontSize: '1rem',
        borderRadius: '8px',
        border: '1px solid #ccc',
        marginBottom: '1rem',
        textAlign: 'right'
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    button: {
        padding: '0.8rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        transition: 'background-color 0.2s ease, transform 0.1s ease',
        minWidth: '120px',
    },
    resultsCard: {
        textAlign: 'center',
    },
    scoreContainer: {
        margin: '2rem 0',
    },
    scoreLabel: {
        fontSize: '1rem',
        color: '#555',
        margin: 0,
    },
    scoreValue: {
        fontSize: '4rem',
        fontWeight: 'bold',
        color: 'var(--primary-color)',
        margin: '0.5rem 0',
        lineHeight: 1,
    },
    scoreTotal: {
        fontSize: '1.5rem',
        color: '#aaa',
        marginLeft: '0.5rem',
    },
    adviceContainer: {
        background: '#e9f5ff',
        padding: '1rem',
        borderRadius: '8px',
        margin: '2rem 0',
    },
    adviceLabel: {
        margin: 0,
        fontWeight: 'bold',
        color: 'var(--primary-color)',
    },
    adviceText: {
        fontSize: '1.1rem',
        margin: '0.5rem 0 0 0',
        lineHeight: 1.7
    },
    loader: {
        border: '5px solid #f3f3f3',
        borderTop: '5px solid var(--primary-color)',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite',
        margin: '2rem auto',
    },
    error: {
        color: '#d9534f',
        marginBottom: '1rem'
    }
};

// Add keyframes for loader animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
