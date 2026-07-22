
import { useState } from "react";
import { useTranslation } from 'react-i18next';

interface QuickQuestionsProps {
  onQuestionSelect: (question: string) => void;
  isLoading: boolean;
}

const QuickQuestions = ({ onQuestionSelect, isLoading }: QuickQuestionsProps) => {
  const { t } = useTranslation();
  const [loadingQuestion, setLoadingQuestion] = useState<string | null>(null);

  const quickQs = [
    t('chat.quickQ1'),
    t('chat.quickQ2'),
    t('chat.quickQ3'),
    t('chat.quickQ4'),
  ];

  const handleClick = async (question: string) => {
    console.log('Quick question clicked:', question);
    setLoadingQuestion(question);
    await onQuestionSelect(question);
    setLoadingQuestion(null);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium mb-3" style={{ color: '#1D1D1F' }}>{t('chat.quickQuestions')}</p>
      {quickQs.map(q => (
        <button
          key={q}
          type="button"
          onClick={() => handleClick(q)}
          disabled={isLoading || loadingQuestion !== null}
          className="w-full rounded border px-4 py-2 text-left hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-wait text-sm"
          style={{
            borderColor: '#ECE9E1',
            color: '#1D1D1F',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={e => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = '#FAF9F5';
              e.currentTarget.style.borderColor = '#3F8F68';
            }
          }}
          onMouseLeave={e => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#ECE9E1';
            }
          }}
        >
          {loadingQuestion === q ? t('buttons.sending') : q}
        </button>
      ))}
    </div>
  );
};

export default QuickQuestions;
