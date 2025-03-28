import {Settings} from '../../settings/Settings';

export interface ISocialMedia {
    displayName:string;
    imageSrc:string;
    imageAlt:string;
    href:string;
    tooltipMessage:string;
}

export const SocialMediaData: ISocialMedia[] = [
    {
        displayName: 'Github',
        imageSrc: '/make-sense/ico/github-logo.png',
        imageAlt: 'GitHub',
        href: Settings.GITHUB_URL,
        tooltipMessage: 'Show us some love ⭐ on GitHub',
    },
    {
        displayName: 'Medium',
        imageSrc: '/make-sense/ico/medium-logo.png',
        imageAlt: 'Medium',
        href: Settings.MEDIUM_URL,
        tooltipMessage: 'Read our AI content on Medium',
    },
    {
        displayName: 'YouTube',
        imageSrc: '/make-sense/ico/youtube-logo.png',
        imageAlt: 'YouTube',
        href: Settings.YOUTUBE_URL,
        tooltipMessage: 'Watch our AI tutorials on YouTube'
    },
    {
        displayName: 'Twitch',
        imageSrc: '/make-sense/ico/twitch-logo.png',
        imageAlt: 'Twitch',
        href: Settings.TWITCH_URL,
        tooltipMessage: 'Fight along with us in Kaggle competitions on Twitch'
    },
];
