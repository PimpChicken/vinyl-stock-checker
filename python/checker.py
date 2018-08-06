from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests
import MySQLdb as mariadb

app = Flask(__name__)
CORS(app)

@app.route("/top5")
def request_top5():
	connection = mariadb.connect(
							 user='******',
							 password='******',
							 database='******')

	cursor = connection.cursor()

	cursor.execute('select distinct cat_no\
		from SEARCHES\
		WHERE DATEDIFF( NOW() , search_timestamp ) <=5\
		group by cat_no\
		order by sum(hits) desc\
		limit 5')

	return jsonify(cursor.fetchall())

@app.route("/redeye")
def request_redeye():
	url = 'http://www.redeyerecords.co.uk/asp/ajax-catnum.asp'
	headers = {
		'User-Agent': 'VinylStockChecker/1.0',
		'Content-Type': 'application/json',
		'Referer': 'https://www.google.com'
	}
	
	data = {
		'q': request.args.get('catNo'),
		'searchVinyl': 'True'
	}

	response = requests.get(url, headers=headers, params=data, verify=False)
	return jsonify(response.json())

@app.route("/redeyesearch")
def request_redeye_search():
	mariadb_connection = mariadb.connect(user='stock_user', password='rekkids_brah', database='stock_checker')
	cursor = mariadb_connection.cursor()

	catNo = request.args.get('catNo')

	if request.args.get('nolog') == 'false':
		try:
			# Log IP
			cursor.execute('SELECT ip_id, hits FROM IPS WHERE ip="{ip}"'.format(ip=request.remote_addr))
			ip_rec = cursor.fetchone()

			if(ip_rec == None):
				cursor.execute('INSERT INTO IPS (ip, hits) VALUES ("{ip}", 1)'.\
				format(ip=request.remote_addr))

				cursor.execute('SELECT MAX(ip_id) FROM IPS')
				ip_rec_id = cursor.fetchone()[0]
			else:
				ip_rec_id = ip_rec[0]
				cursor.execute('UPDATE IPS SET hits = {hits} WHERE ip_id = "{ip_id}"'.\
				format(ip_id=ip_rec[0], hits=int(ip_rec[1]) + 1))

			# Log CatNo Hit
			cursor.execute('SELECT search_id, hits FROM SEARCHES WHERE cat_no="{catNo}" AND ip_id={ip_id}'.format(catNo=catNo, ip_id=ip_rec_id))
			search_rec = cursor.fetchone()

			if(search_rec == None):
				cursor.execute('INSERT INTO SEARCHES (cat_no, hits, ip_id) VALUES ("{catNo}", 1, {ip_id})'.\
				format(catNo=catNo, ip_id=ip_rec_id))
			else:
				cursor.execute('UPDATE SEARCHES SET hits = {hits} WHERE search_id = "{search_id}"'.\
				format(search_id=search_rec[0], hits=int(search_rec[1]) + 1))

			mariadb_connection.commit()
			mariadb_connection.close()

		except Exception as e:
			print('Error Occured: ' + str(e))
			mariadb_connection.close()
		
	url = 'https://www.redeyerecords.co.uk/search/'
	headers = {
		'User-Agent': 'VinylStockChecker/1.0',
		'Content-Type': 'application/json',
		'Referer': 'https://www.google.com'
	}
	
	data = {
		'keywords': request.args.get('catNo'),
		'searchVinyl': 'True',
		'searchType': 'CAT',
		'ajax': 'true'
	}
	
	response = requests.get(url, headers=headers, params=data, verify=False)
	return response.text

@app.route("/whitepeach")
def request_whitepeach():
	url = 'https://www.whitepeachrecords.com/api/search/GeneralSearch'
	headers = {
		'User-Agent': 'VinylStockChecker/1.0',
		'Content-Type': 'application/json',
		'Referer': 'https://www.google.com'
	}
	
	data = {
		'q': request.args.get('catNo')
	}
	
	response = requests.get(url, headers=headers, params=data, verify=False)
	return jsonify(response.json())

@app.route("/getpage")
def request_page():
	url = request.args.get('url')
	headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0',
		'Referer': 'https://www.google.com'
	}
	
	data = {
	}
	
	response = requests.get(url, headers=headers, params=data, verify=False)
	return response.text

@app.route("/getjuno")
def request_juno():
	session = requests.Session()

	result = session.patch('https://www.juno.co.uk/api/v2/currency', data={'isoCode': 'GBP'})
	time.sleep(5)
	url = request.args.get('url')
	response = session.get(url)
	return response.text

@app.route("/postscotch")
def post_scotch():
	catno = request.args.get('catno')
	url = request.args.get('url')
	headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0',
		'Referer': 'https://www.google.com'
	}
	
	data = {
		'search_query': catno
	}
	
	response = requests.post(url, headers=headers, params=data, verify=False)
	return response.text

if __name__ == "__main__":
	app.run(host='0.0.0.0')
