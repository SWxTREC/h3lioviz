module.exports = function (Handlebars) {
  Handlebars.registerHelper('replace', function (textToReplace, text) {
    return text.replace(textToReplace, '');
  })
}
