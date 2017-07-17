import csv, re, os
from ast import literal_eval
from random import randint

def main():
	allseasons = get_all_seasons()

	print(len(allseasons))

def get_all_seasons():
	RESULTS = []
	for file in os.listdir('j-archive-csv'):
		if re.search(r'[0-9]+.csv', file):
			[RESULTS.append(e) for e in get_season(re.search(r'[0-9]+.csv', file).group()[:-4])]
	return RESULTS

def get_season_range(start, end):
	RESULTS = []
	for season in range(int(start), int(end)+1):
		[RESULTS.append(e) for e in get_season(season)]
	return RESULTS

def get_season(season):
	RESULTS = []
	with open('j-archive-csv/j-archive-season-{}.csv'.format(season), 'r', encoding='utf-8') as csvfile:
		for line in csv.DictReader(csvfile):
			RESULTS.append({
				'season': int(season),
				'epNum': int(line['epNum']),
				'airDate': line['airDate'],
				'extra_info': line['extra_info'],
				'round_name': line['round_name'],
				'coord': literal_eval(line['coord']),
				'category': line['category'],
				'order': int(line['order']),
				'value': literal_eval(line['value']),
				'daily_double': line['daily_double'] == 'True',
				'question': line['question'],
				'answer': line['answer'],
				'correctAttempts': int(line['correctAttempts']),
				'wrongAttempts': int(line['wrongAttempts'])
				})	
	return RESULTS

if __name__ == "__main__":
	main()