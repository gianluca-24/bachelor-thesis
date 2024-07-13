from serpapi import GoogleSearch
from urllib.parse import urlsplit, parse_qsl
from flask import Flask, request
import json

app = Flask(__name__) 
  
@app.route('/createScrape', methods = ['POST'])


def createScrape(): 
    data = request.get_json()
    lt = str(data['lt'])
    lg = str(data['lg'])

    params = {
        'api_key': '476be17d6ef92c97c1e2f8b12a4c2a153719f69a7c03897b078ce0d4570e01d9',                # https://serpapi.com/manage-api-key
        'engine': 'google_maps',                # SerpApi search engine	
        'q': 'disco',
        'q': 'nightclub',
        'll': '@'+lt+','+lg+',15.1z',  # GPS coordinates 41.889294, 12.493547
        'type': 'search',                       # list of results for the query
        'hl': 'en',                             # language
        'start': 0,                             # pagination
    }

    search = GoogleSearch(params)               # where data extraction happens on the backend

    local_results = []


    # pagination
    while True:
        results = search.get_dict()             # JSON -> Python dict
        print(results)
        # title = results['local_results']['title']

        if 'next' in results.get('serpapi_pagination', {}):
            search.params_dict.update(dict(parse_qsl(urlsplit(results.get('serpapi_pagination', {}).get('next')).query)))
        else:
            break

        local_results.extend(results['local_results'])

        scrapeFile = json.dumps(local_results, indent=2, ensure_ascii=False)    

    with open("/Users/francescotinessa/Desktop/progetto_ltw/public/jsonFiles/discoList.json", "w") as outfile:
        outfile.write(scrapeFile)
   
    return scrapeFile

if __name__ == "__main__": 
    app.run(port=5000)