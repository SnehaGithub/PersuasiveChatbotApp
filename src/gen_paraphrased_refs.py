import openai
import csv
import time

api_key = ''

# Initialize the OpenAI API client
openai.api_key = api_key



def paraphrase_by_avatar(original_message):
    prompt = f"I will provide you with a message, and as a doctor/healthcare professional, please paraphrase the message: '{original_message}'. In your response do not indicate that I told you to paraphrase the original message. Do not indicate or state that you are a doctor/healthcare professional."
    
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo", #"davinci",
        # prompt=prompt,
        messages=[
            {"role": "user", "content":  prompt },
        ],
        max_tokens=400,
        temperature=0.5,
    )
    
    if response.choices:
        extracted_information = response.choices[0].message.content.strip()#.text.strip()
        return extracted_information
    else:
        return "Error: unable to provide an answer."


def paraphrase_csv(input_file):
    with open(input_file, 'r') as f:
        reader = csv.reader(f)
        rows = list(reader)

    new_rows = []

    header = rows[0]
    new_rows.append(header)
    sentences_column_index = header.index('Refutation')
    header.append('Paraphrased Refutation')

    for i, row in enumerate(rows[1:]):  # Skip header
        sentence = row[sentences_column_index]
        paraphrased = paraphrase_by_avatar(sentence)
        # print("para: ", paraphrased)
        row.append(paraphrased)
        new_rows.append(row)
        # print(rows[i])
        # print(new_rows)
        time.sleep(20)

    with open(input_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(new_rows)


input_file = 'vaping_refs.csv'  # Input and output CSV file
paraphrase_csv(input_file)
