import docx
import sys

def docx_to_markdown(docx_path, md_path):
    try:
        # Load the Word document
        doc = docx.Document(docx_path)
        
        # Extract text from each paragraph
        text_content = []
        for para in doc.paragraphs:
            if para.text.strip():  # Only include non-empty paragraphs
                text_content.append(para.text)
        
        # Join paragraphs with double newlines for Markdown
        markdown_content = '\n\n'.join(text_content)
        
        # Write to Markdown file
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
            
        print(f"Successfully converted {docx_path} to {md_path}")
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_docx_to_md.py <input_docx> <output_md>")
        sys.exit(1)
        
    input_docx = sys.argv[1]
    output_md = sys.argv[2]
    docx_to_markdown(input_docx, output_md)
