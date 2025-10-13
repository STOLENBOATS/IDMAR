all:
	bash create_labels.sh
	python3 create_github_issues.py
