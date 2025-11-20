import React from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
    RadioGroup,
    RadioGroupItem,
} from "../components/ui/radio-group";
import { CheckCircle2, Info } from "lucide-react";
import { cn } from "../lib/utils";

type Option = {
    id: string;
    label: string;
};

type Question = {
    id: string;
    text: string;
    options: Option[];
    correctOptionId: string;
    explanation: string;
    hint: string;
};

const QUESTIONS: Question[] = [
    {
        id: "q1",
        text: `Berdasarkan laporan McKinsey "The State of AI in 2022", berapa persentase rata-rata penggunaan AI di industri yang disebutkan telah meningkat dari tahun 2017 hingga 2022?`,
        options: [
            { id: "a", label: "Dari 20% menjadi 31%" },
            { id: "b", label: "Dari 20% menjadi 50%" },
            { id: "c", label: "Dari 10% menjadi 25%" },
            { id: "d", label: "Dari 5% menjadi 20%" },
        ],
        correctOptionId: "b",
        explanation:
            "Laporan McKinsey menyebutkan bahwa rata-rata penggunaan AI di industri meningkat dua kali lipat dari 20% pada tahun 2017 menjadi 50% pada tahun 2022.",
        hint:
            "Perhatikan bahwa adopsi AI yang disebutkan dalam laporan tersebut menunjukkan pertumbuhan yang sangat signifikan, bukan kenaikan kecil.",
    },
    {
        id: "q2",
        text: "Apa tujuan utama penggunaan AI dalam proses bisnis menurut laporan tersebut?",
        options: [
            { id: "a", label: "Menggantikan seluruh tenaga kerja manusia" },
            { id: "b", label: "Meningkatkan efisiensi dan pengambilan keputusan" },
            { id: "c", label: "Membuat proses menjadi lebih rumit" },
            { id: "d", label: "Mengurangi kebutuhan data" },
        ],
        correctOptionId: "b",
        explanation:
            "AI terutama dimanfaatkan untuk meningkatkan efisiensi operasional dan membantu pengambilan keputusan berbasis data.",
        hint:
            "Ingat bahwa AI biasanya digunakan sebagai alat bantu, bukan pengganti total manusia.",
    },
    {
        id: "q3",
        text: "Mengapa penting bagi perusahaan untuk berinvestasi pada talenta AI?",
        options: [
            { id: "a", label: "Agar dapat mengikuti tren saja" },
            { id: "b", label: "Untuk memenuhi kewajiban hukum" },
            { id: "c", label: "Untuk memaksimalkan nilai bisnis dari teknologi AI" },
            { id: "d", label: "Supaya bisa menghapus semua proses manual" },
        ],
        correctOptionId: "c",
        explanation:
            "Talenta AI yang tepat membantu perusahaan merancang solusi yang relevan, aman, dan memberikan nilai nyata bagi bisnis.",
        hint:
            "Fokus pada hubungan antara keahlian manusia dan kemampuan teknologi.",
    },
];

const QUIZ_DURATION_SECONDS = 5 * 60;

export const QuizPage: React.FC = () => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [selectedOption, setSelectedOption] = React.useState<string | null>(
        null
    );
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
    const [remainingSeconds, setRemainingSeconds] = React.useState(
        QUIZ_DURATION_SECONDS
    );

    const totalQuestions = QUESTIONS.length;
    const question = QUESTIONS[currentIndex];

    React.useEffect(() => {
        const id = window.setInterval(() => {
            setRemainingSeconds((prev) => Math.max(prev - 1, 0));
        }, 1000);
        return () => window.clearInterval(id);
    }, []);

    const handleSelect = (value: string) => {
        setSelectedOption(value);
        setIsSubmitted(true);
        setIsCorrect(value === question.correctOptionId);
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
            setIsCorrect(null);
        } else {
            alert("Quiz selesai (dummy). Nanti bisa diarahkan ke halaman hasil.");
        }
    };

    const progressValue = ((currentIndex + 1) / totalQuestions) * 100;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const timerLabel = `${minutes.toString().padStart(2, "0")}m:${seconds
        .toString()
        .padStart(2, "0")}s`;

    return (
        <main className="min-h-screen bg-app-bg flex items-center justify-center px-4 py-10">
            <Card className="w-full max-w-5xl rounded-2xl shadow-card border bg-white">
                <CardHeader className="px-8 pt-6 pb-4 flex flex-row items-center justify-between">
                    <div className="text-sm font-medium text-app-muted">
                        Pertanyaan {currentIndex + 1} dari {totalQuestions}
                    </div>
                    <div
                        className="rounded-full bg-app-primarySoft text-xs font-semibold text-app-primary px-4 py-2"
                        role="status"
                        aria-label={`Sisa waktu kuis ${minutes} menit ${seconds} detik`}
                    >
                        {timerLabel}
                    </div>
                </CardHeader>

                <div className="px-8">
                    <div className="h-2 rounded-full bg-app-progressTrack overflow-hidden">
                        <div
                            className="h-full bg-app-progress transition-all"
                            style={{ width: `${progressValue}%` }}
                        />
                    </div>
                </div>

                <CardContent className="px-8 pb-6 pt-6 space-y-6">
                    <h1
                        className="text-lg leading-relaxed font-semibold text-app-text"
                        id="question-label"
                    >
                        {question.text}
                    </h1>

                    <RadioGroup
                        value={selectedOption ?? undefined}
                        onValueChange={handleSelect}
                        aria-labelledby="question-label"
                        className="flex flex-col gap-3 mt-2"
                    >
                        {question.options.map((option) => {
                            const isSelected = selectedOption === option.id;
                            const isOptionCorrect = option.id === question.correctOptionId;
                            const showCorrectCheck =
                                isSubmitted && isOptionCorrect && isSelected;

                            const borderColor = isSubmitted
                                ? isOptionCorrect && isSelected
                                    ? "border-app-success"
                                    : isSelected
                                        ? "border-app-primary"
                                        : "border-app-border"
                                : isSelected
                                    ? "border-app-primary"
                                    : "border-app-border";

                            const bgColor =
                                isSubmitted && isSelected && isOptionCorrect
                                    ? "bg-app-successSoft"
                                    : isSelected
                                        ? "bg-gray-50"
                                        : "bg-white";

                            return (
                                <label
                                    key={option.id}
                                    className={cn(
                                        "w-full flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                                        bgColor,
                                        borderColor
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem
                                            value={option.id}
                                            id={option.id}
                                            className="mt-px"
                                            aria-label={option.label}
                                        />
                                        <span className="text-sm text-app-text">
                                            {option.label}
                                        </span>
                                    </div>
                                    {showCorrectCheck && (
                                        <CheckCircle2
                                            aria-hidden
                                            className="h-5 w-5 text-app-success"
                                        />
                                    )}
                                </label>
                            );
                        })}
                    </RadioGroup>

                    {isSubmitted && (
                        <section
                            className="mt-4"
                            aria-live="polite"
                            aria-label="Penjelasan jawaban"
                        >
                            <Card className="border border-app-border shadow-none rounded-xl">
                                <CardHeader className="pb-2">
                                    <h2 className="font-semibold text-app-text">Penjelasan</h2>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm leading-relaxed text-app-muted">
                                        {question.explanation}
                                    </p>

                                    <Alert className="bg-app-infoSoft border-none rounded-xl">
                                        <Info className="h-4 w-4 text-app-info" />
                                        <AlertTitle className="text-xs font-semibold text-app-info">
                                            Hint
                                        </AlertTitle>
                                        <AlertDescription className="text-xs text-app-muted mt-1">
                                            {question.hint}
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </section>
                    )}
                </CardContent>

                <CardFooter className="px-8 pb-6 pt-4 flex justify-end">
                    <Button
                        onClick={handleNext}
                        className="rounded-xl px-6 bg-app-primary text-white hover:bg-blue-700"
                    >
                        {currentIndex === totalQuestions - 1
                            ? "Selesaikan"
                            : "Soal Berikutnya"}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
};
