
import { LinkObj } from './link-obj';

export class NavLinks {

    public static readonly links: LinkObj[] = [
        new LinkObj('Home', '/'),
        new LinkObj('About', '/about'),
        new LinkObj('Subscriptions', '/subscriptions'),
        
        // hidden links

        //new LinkObj('Payment', '/payment'),
        new LinkObj('View Bookings', '/bookings', false),
        new LinkObj('Create Booking', '/bookings/new', false),
        new LinkObj('Account', '/account', false)
    ];

}
