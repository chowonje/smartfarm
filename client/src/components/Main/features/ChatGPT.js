import React, { useState } from 'react';
import '../../../styles/ChatGPT.css';

function ChatGPT() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/api/chatgpt/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });
            const data = await response.json();
            
            if (data.success) {
                setAnswer(data.answer);
            } else {
                console.error('Error:', data.error);
                setAnswer('죄송합니다. 답변을 받아오는 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            setAnswer('서버 연결 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatgpt-container">
            <h2>스마트팜 어시스턴트</h2>
            <form onSubmit={handleSubmit} className="chatgpt-form">
                <div className="input-container">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="수경재배나 스마트팜에 대해 질문해주세요"
                        className="chatgpt-input"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="chatgpt-button"
                    >
                        {isLoading ? '답변 중...' : '질문하기'}
                    </button>
                </div>
            </form>
            {answer && (
                <div className="answer-container">
                    <h3>답변:</h3>
                    <p className="answer-text">{answer}</p>
                </div>
            )}
        </div>
    );
}

export default ChatGPT; 