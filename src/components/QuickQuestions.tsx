
import { useState } from "react";

interface QuickQuestionsProps {
  onQuestionSelect: (question: string) => void;
  isLoading: boolean;
}

const QuickQuestions = ({ onQuestionSelect, isLoading }: QuickQuestionsProps) => {
  const [loadingQuestion, setLoadingQuestion] = useState<string | null>(null);

  const quickQs = [
    "Analyze my recent meal patterns",
    "Help me understand my symptoms", 
    "Suggest foods for better digestion",
    "What should I track daily?",
  ];

  const handleClick = async (question: string) => {
    console.log('Quick question clicked:', question);
    setLoadingQuestion(question);
    await onQuestionSelect(question);
    setLoadingQuestion(null);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium mb-3" style={{ color: '#2E2E2E' }}>Quick questions:</p>
      {quickQs.map(q => (
        <button
          key={q}
          type="button"
          onClick={() => handleClick(q)}
          disabled={isLoading || loadingQuestion !== null}
          className="w-full rounded border px-4 py-2 text-left hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-wait text-sm"
          style={{
            borderColor: '#D3D3D3',
            color: '#2E2E2E',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={e => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = '#F9F8F4';
              e.currentTarget.style.borderColor = '#4A7C59';
            }
          }}
          onMouseLeave={e => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#D3D3D3';
            }
          }}
        >
          {loadingQuestion === q ? "Sending…" : q}
        </button>
      ))}
    </div>
  );
};

export default QuickQuestions;
