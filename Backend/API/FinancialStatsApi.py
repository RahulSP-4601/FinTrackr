from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
# Allow CORS for both the React frontend and proxy server
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5001"]}})

# Load Firebase credentials
cred = credentials.Certificate('/Users/rahulpanchal/Desktop/Project/my-finance-tracker/src/serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route('/api/v1/financial-stats', methods=['GET'])
def get_financial_stats():
    print("Request received for financial stats")  # Add logging
    try:
        balance_ref = db.collection('balance').document('balance')
        expense_ref = db.collection('expense').document('expense')
        income_ref = db.collection('income').document('income')

        balance_doc = balance_ref.get()
        expense_doc = expense_ref.get()
        income_doc = income_ref.get()

        if balance_doc.exists and expense_doc.exists and income_doc.exists:
            balance = balance_doc.to_dict().get('amount', 0)
            expenses = expense_doc.to_dict().get('amount', 0)
            income = income_doc.to_dict().get('amount', 0)

            financial_stats = {
                'balance': balance,
                'expenses': expenses,
                'income': income
            }
            return jsonify(financial_stats), 200
        else:
            return jsonify({'error': 'One or more documents not found'}), 404
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response

if __name__ == '__main__':
    app.run(debug=True)
