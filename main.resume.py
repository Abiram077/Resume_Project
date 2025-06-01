import streamlit as st
import PyPDF2
import io
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# 🌐 Load environment variables
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")  # Store in .env

# ✅ Hugging Face client
client = InferenceClient(token=HF_TOKEN)

# 🖼️ Streamlit UI Setup
st.set_page_config(page_title="AI Resume Critique", layout="centered")
st.title("AI Resume Critique")
st.write("Upload your resume and get instant feedback powered by Hugging Face summarization.")

# 📤 File uploader
uploaded_file = st.file_uploader("Upload your resume (PDF or TXT)", type=["pdf", "txt"])
job_role = st.text_input("Enter the job role you're targeting (optional)")
analyze = st.button("Analyze Resume")

# 📄 PDF Text Extractor
def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

# 🧾 File Extractor Wrapper
def extract_text_from_file(upload_file):
    if uploaded_file.type == "application/pdf":
        return extract_text_from_pdf(io.BytesIO(uploaded_file.read()))
    return upload_file.read().decode("utf-8")

# 🧠 Feedback Generator using Hugging Face Summarization
def generate_feedback(text, role=None):
    trimmed_text = text[:1500]  # Keep within token limit

    summary = client.summarization(
        trimmed_text,
        model="facebook/bart-large-cnn"
    )

    suggestions = f"""
### 📋 Resume Summary:
{summary}

---

### ✅ Recommendations:
- Use bullet points for better readability.
- Quantify achievements (e.g., "increased sales by 20%").
- Align your experience with **{role if role else "target roles"}**.
- Emphasize technical and soft skills.
- Include certifications and projects if available.
"""
    return suggestions

# 🔍 Run Analyzer
if analyze and uploaded_file:
    try:
        file_content = extract_text_from_file(uploaded_file)

        if not file_content.strip():
            st.error("The file doesn't contain any content.")
            st.stop()

        with st.spinner("Analyzing resume..."):
            feedback = generate_feedback(file_content, job_role)

        st.markdown("### 🧠 AI Feedback")
        st.markdown(feedback)

    except Exception as e:
        st.error(f"An error occurred: {str(e)}")
