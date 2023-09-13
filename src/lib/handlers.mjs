import { getTagline } from './tagline.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MAIN PAGES ------------------------------------------------------------------------------------
export function home(req, res) {
    res.render('home', { currentPage: 'home', colorMode: req.cookies.color_mode });
}

export function about(req, res) {
    res.render('about', { tagline: getTagline(), currentPage: 'about', colorMode: req.cookies.color_mode });
}

export function colorMode(req, res) {
    res.cookie('color_mode', req.params.mode, {maxAge: 30 * 24 * 60 * 60 * 1000});
    res.redirect(req.get('referer'));
}
// END MAIN PAGES --------------------------------------------------------------------------------

// SETUP PHOTO CONTEST ---------------------------------------------------------------------------
export function setupPhotoContest(req, res) {
    const now = new Date();
    res.render('contest/setup-photo', { year: now.getFullYear(), month: now.getMonth() });
}
// END SETUP PHOTO CONTEST -----------------------------------------------------------------------

// API -------------------------------------------------------------------------------------------
export const api = {
    newsletterSignup: (req, res) => {
        const VALID_EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        const csrf = req.body._csrf;
        const name = req.body.name;
        const email = req.body.email;

        if (!VALID_EMAIL_REGEX.test(email)) {
            res.send( { result: 'error', error: 'Email is invalid!' });
            return;
        }

        console.log('CSRF:', csrf);
        console.log('Name:', name);
        console.log('Email:', email);
        
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.'
        };

        res.send({ result: 'success' });
    },
    setupPhotoContest: (req, res, fields, files) => {
        const uploadedFile = files.photo[0];
        const tmp_path = uploadedFile.path;
        const target_dir = `${__dirname}/../../public/contest-uploads/${req.params.year}/${req.params.month}`;

        if (!fs.existsSync(target_dir)){
            fs.mkdirSync(target_dir, { recursive: true });
        }

        fs.rename(tmp_path, `${target_dir}/${uploadedFile.originalFilename}`, function(err) {
            if (err) {
                res.send( { result: 'error', error: err.message });
                return;
            }
            fs.unlink(tmp_path, function(err) {
                if (err) {
                    res.send( { result: 'error', error: err.message });
                    return;
                }
                res.send( { result: 'success' });
            });
        });
    },
    setupPhotoContestError: (req, res, message) => {
        res.send( { result: 'error', error: message });
    }
};
// END API ---------------------------------------------------------------------------------------

// FETCH NEWSLETTER ------------------------------------------------------------------------------
export function newsletter(req, res) {
    res.render('newsletter', { csrf: 'CSRF token goes here', currentPage: 'newsletter' });
}

export function newsletterArchive(req, res) {
    res.render('newsletter-archive');
}
// END FETCH NEWSLETTER --------------------------------------------------------------------------

// ERROR HANDLING --------------------------------------------------------------------------------
export function notFound(req, res) {
    res.render('404');
}

export function serverError(err, req, res) {
    res.render('500');
}
// END ERROR HANDLING ----------------------------------------------------------------------------

export default {
    home,
    about,
    notFound,
    serverError,
    newsletter,
    newsletterArchive,
    api,
    setupPhotoContest,
    colorMode
};
