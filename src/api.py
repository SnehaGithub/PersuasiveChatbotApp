from torch import cosine_similarity
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import csv
import numpy as np
from flask_cors import CORS, cross_origin
import openai

api_key = ''

# Initialize the OpenAI API client
openai.api_key = api_key


app = Flask(__name__)
app.config['SECRET_KEY'] = 'insert secret key here'
app.config['CORS_HEADERS'] = 'Content-Type'

cors = CORS(app, resources={r"/compare_message": {"origins": "http://localhost:3000"}})
# CORS(app)

# Load the sentence transformer model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Load the CSV file
csv_file = 'vaping_refs.csv'
messages = []
refs = []
#para_refs = []
with open(csv_file, 'r') as file:
    reader = csv.reader(file)
    for row in reader:
        messages.append(row[0])  # Assuming the message is in the first column
        refs.append(row[1])
        #para_refs.append(row[2])

def compute_similarity(sentence1, sentence2):
    embeddings = model.encode([sentence1, sentence2])
    similarity = np.dot(embeddings[0], embeddings[1]) / (np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1]))
    return similarity

# Function to compare the message with texts in the CSV file
def compare_message(message):
    # Convert the message to embeddings
    # message_embedding = model.encode([message])[0]
    
    # Compare with each text in the CSV file
    for i in range(len(messages)): #text in messages:
        text = messages[i]
        # text_embedding = model.encode([text])[0]
        # similarity = cosine_similarity([message_embedding], [text_embedding])[0][0]
        similarity = compute_similarity(text, message)
        if similarity > 0.8:
            print("Similarity SCORE: ", similarity)
            return refs[i] #para_refs[i]
    return None

def paraphrase_by_avatar(original_message):
    prompt = f"I will provide you with a message, and as a doctor/healthcare professional, please paraphrase the message: '{original_message}'. In your response do not indicate that I told you to paraphrase the original message. Do not indicate or state that you are a doctor/healthcare professional."
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", #"davinci",
        # prompt=prompt,
        messages=[
            {"role": "user", "content":  prompt },
        ],
        max_tokens=50,
        temperature=0.5,
    )
    
    if response.choices:
        extracted_information = response.choices[0].message.content.strip()#.text.strip()
        return extracted_information
    else:
        return None #"Error: unable to provide an answer."



# Endpoint to handle incoming messages
@app.route('/compare_message', methods=['POST'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def compare_message_endpoint():
    data = request.get_json()
    user_message = data['message']
    # response = jsonify({'message': 'TEST'})

    similar_text = compare_message(user_message)
    if similar_text:
        print("similar text found!")
        response = jsonify({'message': similar_text})
    else:
        print("No similar text found!", similar_text)
        response = jsonify({'message': 'No similar message found in the CSV file'})
    
    # response.headers.add('Access-Control-Allow-Origin', '*')
    # paraphrased_response = paraphrase_by_avatar(response)
    # if paraphrased_response is not None:
    #     print("paraphrasign works")
    #     return paraphrased_response
    return response

if __name__ == '__main__':
    app.run(debug=True)
