import zipfile
import xml.etree.ElementTree as ET
import json
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as zipf:
            xml_content = zipf.read('word/document.xml')
        
        tree = ET.XML(xml_content)
        NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
        
        paragraphs = []
        for paragraph in tree.iter(NAMESPACE + 'p'):
            texts = [node.text for node in paragraph.iter(NAMESPACE + 't') if node.text]
            if texts:
                paragraphs.append(''.join(texts))
                
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error reading docx: {e}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = read_docx(sys.argv[1])
        print(text)
