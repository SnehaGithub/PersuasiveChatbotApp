import json
import csv
from datetime import datetime

def flatten_json(json_obj):
    flat_data = []
    for user_id, conversations in json_obj.items():
        for conversation_id, messages in conversations.items():
            for message_id, message_data in messages.items():
                # print("MESSAGE DATA: ", message_data, type(message_data))
                # print("MESSAGE DATA timestamp: ", message_data['timestamp'], type(message_data['timestamp']))
                try:
                    timestamp = datetime.utcfromtimestamp(int(message_data['timestamp'])/1000).strftime('%Y-%m-%d %H:%M:%S')
                    flat_data.append({
                        'userId': user_id,
                        'conversationId': conversation_id,
                        'message': message_data['message'],
                        'sender': message_data['sender'],
                        'timestamp': timestamp
                    })
                
                except:
                    print("exception at end")
                    print("message that caused exception is: ", message_data)
                    print("\n")
                
    return flat_data

def write_to_csv(data, filename):
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['userId', 'conversationId', 'message', 'sender', 'timestamp']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            writer.writerow(row)

def main():
    # Load JSON data
    with open('export_json_to_firebase.json', 'r') as file:
        json_data = json.load(file)
    
    # Flatten JSON data
    flat_data = flatten_json(json_data)
    
    # Write flattened data to CSV
    write_to_csv(flat_data, 'output_firebase.csv')

if __name__ == "__main__":
    main()