from flask import Flask, request, jsonify
import spacy
import re

app = Flask(__name__)

spacy.prefer_gpu()
# nlp = spacy.load('en_core_web_sm')
nlp = spacy.load('en_core_web_trf')

@app.route('/api/v1/geocode', methods=['POST'])
def geocode():
    return jsonify({
        'status': 'success',
        'data': {
            'geocodes': [e.text for e in nlp(request.json['text']).ents if bool(re.match(r'[^0-9]+', e.text)) == True]
        }
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
