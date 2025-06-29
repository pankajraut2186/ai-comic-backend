import gradio as gr
import requests
import os

BACKEND_URL = os.getenv("https://ai-comic-backend.onrender.com/", "http://localhost:3000")

def generate_comic(prompt, style, characterRef, dialogue, ref_img, mode, control_type):
    files = {'refImage': ref_img} if ref_img else {}
    data = {
        "prompt": prompt,
        "style": style,
        "characterRef": characterRef,
        "dialogue": dialogue,
        "mode": mode,
        "controlType": control_type
    }

    response = requests.post(f"{BACKEND_URL}/api/generate", data=data, files=files)
    result = response.json()

    if mode == "comic":
        return [panel["imageUrl"] for panel in result["panels"]]
    else:
        return [result["imageUrl"]]

with gr.Blocks(title="AI Comic Generator") as demo:
    gr.Markdown("## 🎨 AI Comic Creator using Stability AI")

    with gr.Row():
        prompt = gr.Textbox(label="Scene Prompt")
        style = gr.Textbox(label="Visual Style", value="comic book")

    with gr.Row():
        characterRef = gr.Textbox(label="Character Description")
        dialogue = gr.Textbox(label="Dialogues (one per line)")

    with gr.Row():
        ref_img = gr.Image(type="file", label="Reference Image")
        control_type = gr.Dropdown(["pose", "depth", "canny", None], label="ControlNet Type", value=None)
        mode = gr.Radio(["single", "comic"], value="comic", label="Generation Mode")

    generate_btn = gr.Button("Generate")
    output_gallery = gr.Gallery(label="Generated Comic Panels").style(grid=[2], height=400)

    generate_btn.click(
        generate_comic,
        inputs=[prompt, style, characterRef, dialogue, ref_img, mode, control_type],
        outputs=output_gallery
    )

demo.launch()