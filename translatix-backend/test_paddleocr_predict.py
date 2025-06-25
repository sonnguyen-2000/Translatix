from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=False, lang='en')

image_url = "https://paddle-model-ecology.bj.bcebos.com/paddlex/imgs/demo_image/general_ocr_002.png"

results = ocr.ocr(image_url)

# In toàn bộ kết quả để kiểm tra cấu trúc
import pprint
pprint.pprint(results)
