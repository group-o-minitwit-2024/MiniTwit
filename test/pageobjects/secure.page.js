const { $ } = require('@wdio/globals')
const Page = require('./page');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class SecurePage extends Page {
    /**
     * define selectors using getter methods
     */
    // get flashAlert () {
    //     return $('#flash');
    // }

    get flashAlert () {
        return $$('.flashes li').map(element => element.getText());
    }
}

module.exports = new SecurePage();
