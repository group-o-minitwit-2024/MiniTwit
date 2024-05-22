const { $ } = require('@wdio/globals')
const Page = require('./page');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class TimelinePage extends Page {
    /**
     * define selectors using getter methods
     */

    get inputText () {
        return $('input[name="text"]');
    }

    get btnSubmit () {
        return $('input[type="submit"]');
    }

    async addMessage (message) {
        await this.inputText.setValue(message);
        (await this.btnSubmit).click();
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    open () {
        return super.open('');
    }
}

module.exports = new TimelinePage();