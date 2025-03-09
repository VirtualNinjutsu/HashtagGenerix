import sys
import json
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from langdetect import detect
from stop_words import get_stop_words
import pymorphy2
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import inspect
import io

# Установка явной кодировки для stdout и stderr
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Обходной путь для совместимости с Python 3.11+
if not hasattr(inspect, 'getargspec'):
    def getargspec(func):
        sig = inspect.signature(func)
        params = sig.parameters
        args = []
        varargs = None
        varkw = None
        defaults = []
        for name, param in params.items():
            if param.kind == param.POSITIONAL_OR_KEYWORD:
                args.append(name)
                if param.default != param.empty:
                    defaults.append(param.default)
            elif param.kind == param.VAR_POSITIONAL:
                varargs = name
            elif param.kind == param.VAR_KEYWORD:
                varkw = name
        return args, varargs, varkw, tuple(defaults) if defaults else None

    inspect.getargspec = getargspec

# Инициализация
nltk.download('punkt_tab', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
lemmatizer_en = WordNetLemmatizer()
lemmatizer_ru = pymorphy2.MorphAnalyzer()

def lang_detect(text):
    """
    RU: Определение языка ввода
    EN: Determining the input language
    """
    try:
        lang = detect(text)
        return lang
    except:
        lang = 'en'
        return lang

def preprocess_text(text, language):
    """RU: Подготовка текста
       EN: Text preprocessing
    """
    stop_words = set(get_stop_words(language))

    if (language == 'ru'):
        lemmatizer = lemmatizer_ru
        tokens = word_tokenize(text.lower())
        tokens = [lemmatizer.parse(token)[0].normal_form for token in tokens if token.isalnum() and token not in stop_words]
    else:
        lemmatizer = lemmatizer_en
        tokens = word_tokenize(text.lower())
        tokens = [lemmatizer.lemmatize(token) for token in tokens if token.isalnum() and token not in stop_words]

    return tokens

def extract_tfidf_tags(text, language, top_n=6):
    """
    Args:
        text (str): Входной текст. // Input text.
        top_n (int): Количество тегов для возврата. // Number of tags to return.
    Returns:
        list: Список тегов. // List of tags.
    """
    tokens = preprocess_text(text, language)
    if not tokens:
        return []

    text_line = ' '.join(tokens)

    vectorizer = TfidfVectorizer(max_features=1000)
    tfidf_matrix = vectorizer.fit_transform([text_line])

    feature_names = vectorizer.get_feature_names_out()
    tfidf_scores = tfidf_matrix.toarray()[0]

    tfidf_df = pd.DataFrame({'word': feature_names, 'score': tfidf_scores})
    tfidf_df = tfidf_df.sort_values(by='score', ascending=False)

    top_tags = tfidf_df.head(top_n)['word'].tolist()
    return top_tags

def get_tfidf_vector(text, language):
    tokens = preprocess_text(text, language)
    if not tokens:
        return None, None

    document = ' '.join(tokens)
    vectorizer = TfidfVectorizer(max_features=1000, stop_words=get_stop_words(language))
    tfidf_matrix = vectorizer.fit_transform([document])
    return vectorizer, tfidf_matrix

def search_tags(text, tag_list, language, top_n=6):
    vectorizer, text_tfidf = get_tfidf_vector(text, language)
    if text_tfidf is None:
        return []
    lang = lang_detect(text)
    tag_document = [' '.join(preprocess_text(tag, lang)) for tag in tag_list]
    tag_tfidf = vectorizer.transform(tag_document)

    similarities = cosine_similarity(text_tfidf, tag_tfidf)[0]
    tag_similarities = pd.DataFrame({'tag': tag_list, 'similarity': similarities})
    tag_similarities = tag_similarities.sort_values(by='similarity', ascending=False)

    top_matching_tags = tag_similarities.head(top_n)['tag'].tolist()
    return top_matching_tags

if __name__ == "__main__":

    # Проверка аргументов
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Not enough arguments. Expected: text, tag_list"}))
        sys.exit(1)

    # Логирование аргументов
    print(f"Аргументы: {sys.argv}", file=sys.stderr)

    try:
        input_text = sys.argv[1]
        tag_list = sys.argv[2]
        # tag_list = json.loads(tag_list)
    except Exception as e:
        print(json.dumps({"error": f"Failed to parse arguments: {str(e)}"}))
        sys.exit(1)

    # Логирование передаваемых данных
    print(f"Received text: {input_text}", file=sys.stderr)
    print(f"Received tags: {tag_list}", file=sys.stderr)

    # Определяем язык
    language = lang_detect(input_text)
    print(f"Detected language: {language}", file=sys.stderr)

    # Получаем подходящие теги
    matching_tags = search_tags(input_text, tag_list, language)
    print(f"Matching tags: {matching_tags}", file=sys.stderr)

    # Формируем результат
    result = {
        "matching_tags": matching_tags
    }
    print(json.dumps(result))

