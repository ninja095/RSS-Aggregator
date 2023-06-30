export default (responseData) => {
  const domParser = new DOMParser();
  const xmlDocument = domParser.parseFromString(responseData, 'application/xml');
  const errorNode = xmlDocument.querySelector('parsererror');

  if (errorNode) {
    const parsingError = new Error(errorNode.textContent);
    parsingError.isParsingError = true;
    throw parsingError;
  }
  const channel = xmlDocument.querySelector('channel');
  const channelTitle = xmlDocument.querySelector('channel title').textContent;
  const channelDescription = xmlDocument.querySelector('channel description').textContent;

  const feed = { title: channelTitle, description: channelDescription };

  const itemElements = channel.getElementsByTagName('item');

  const posts = [...itemElements].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('channel link').textContent;

    return { title, description, link };
  });

  return { feed, posts };
};
