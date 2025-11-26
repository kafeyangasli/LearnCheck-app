import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

interface IntroProps {
    onStart: () => void;
    isLoading?: boolean;
}

const Intro: React.FC<IntroProps> = ({ onStart, isLoading = false }) => (
    <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-lg text-center">
            <h1 className="text-3xl font-bold mb-2">Siap Uji Pemahamanmu?</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
                Setelah membaca materi, yuk cek seberapa jauh kamu sudah paham. Kuis singkat ini dibuat oleh AI khusus untukmu berdasarkan materi yang baru saja kamu pelajari.
            </p>
            <div className="flex justify-center">
                <Button onClick={onStart} size="lg" disabled={isLoading}>
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader />
                            <span>Memuat...</span>
                        </div>
                    ) : 'Mulai Cek Pemahaman!'}
                </Button>
            </div>
        </Card>
    </div>
);

export default Intro;
