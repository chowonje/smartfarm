import sys
import json
import logging
from transformers import pipeline
from pathlib import Path

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_text(text):
    try:
        # 모델 경로 확인
        model_path = Path("../models/agriculture-model")
        if not model_path.exists():
            raise FileNotFoundError("모델 파일을 찾을 수 없습니다")

        # 모델 로드
        logger.info("모델을 로드하는 중...")
        classifier = pipeline("text-classification", model=str(model_path))
        
        # 텍스트 분석
        logger.info("텍스트 분석 중...")
        result = classifier(text)
        
        return json.dumps({
            "success": True,
            "result": result
        })
        
    except Exception as e:
        logger.error(f"분석 중 오류 발생: {str(e)}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = sys.argv[1]
        print(analyze_text(text))
    else:
        print(json.dumps({
            "success": False,
            "error": "분석할 텍스트가 제공되지 않았습니다"
        }))