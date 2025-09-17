window.browse = function() {
    let url = document
        .querySelector("input[name='url']")
        .value
        .trim();
    url = !/^https?:\/\//.test(url)
        ? `https://${url}`
        : url;

    browser.webfuseSession
        .relocate(url);
}