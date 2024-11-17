import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

device = "mps" if torch.cuda.is_available() else "cpu"


def generate_answer(query, context):

    model_name = "meta-llama/Llama-3.2-1B-Instruct"
    token_id = "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"

    tokenizer = AutoTokenizer.from_pretrained(model_name, token=token_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        token=token_id,
        # quantization_config=bnb_config,  # Apply quantization
        device_map=device,  # Map model to available devices automatically
    )

    messages = [
        {
            "role": "user",
            "content": f"Étant donné les articles d'une norme de référence suivants et un article non-conforme à la norme propose une rédaction du même style que l'article non-conforme mais qui soit conforme à la norme. Envoie uniquement la proposition, sans autre commentaire: \n\nArticles de la norme \n{context}\n\nArticle non-conforme\n {query}\n\nProposition: ",
        },
    ]

    encodeds = tokenizer.apply_chat_template(messages, return_tensors="pt")

    model_inputs = encodeds.to(device)

    generated_ids = model.generate(
        model_inputs,
        max_length=4096,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id,
        num_return_sequences=1,
        temperature=0.005,
    )

    generated_text = tokenizer.decode(generated_ids[0], skip_special_tokens=True)

    model_answer = " ".join(generated_text.split("assistant")[1:])
    print("generation text: \n", model_answer)
    return model_answer
