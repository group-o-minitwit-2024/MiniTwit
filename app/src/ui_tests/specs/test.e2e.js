const { expect } = require('@wdio/globals')
const RegisterPage = require('../pageObjects/register.page')
const LoginPage = require('../pageobjects/login.page')
const SecurePage = require('../pageobjects/secure.page')
const TimelinePage = require('../pageobjects/timeline.page')

describe('My MiniTwit application', () => {
    it('should register with valid credentials', async () => {
        await RegisterPage.open()

        await RegisterPage.register('tomsmith', 'tomsmith@mail.com', 'SuperSecretPassword!')
        // await expect(await browser.getUrl()).toEqual("http://localhost:5000/login")
        await expect(await LoginPage.flashAlert[0]).toEqual('You were successfully registered and can login now')
    })

    it('should login with valid credentials', async () => {
        await LoginPage.open()

        await LoginPage.login('tomsmith', 'SuperSecretPassword!')
         // await expect(await browser.getUrl()).toEqual('http://localhost:5000/')
        await expect(await TimelinePage.flashAlert[0]).toEqual('You were logged in')
    })

    it('should add message to timeline', async () => {
        await TimelinePage.open()

        await TimelinePage.addMessage('Why does naturwine taste like shit and gives me hangover')
        await expect(await TimelinePage.flashAlert[0]).toEqual('Your message was recorded')
    })
})