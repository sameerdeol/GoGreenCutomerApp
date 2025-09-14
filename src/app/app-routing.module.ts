import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page'; // Import SignupPage
import { SplashscreenPage } from './splashscreen/splashscreen.page';
import { WelcomePage } from './welcome/welcome.page';
import { WelcomeOnePage } from './welcome-one/welcome-one.page';
import { OtpPage } from './otp/otp.page';
import { LocationPage } from './location/location.page';
import { SelectLocationPage } from './select-location/select-location.page';
import { CheckoutPage } from './checkout/checkout.page';

const routes: Routes = [
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  { path: 'login', component: LoginPage },
  { path: 'splashscreen', component: SplashscreenPage },
  { path: 'welcome', component: WelcomePage },
  { path: 'welcome-one', component: WelcomeOnePage },
  { path: 'otp', component: OtpPage },
  { path: 'location', component: LocationPage },
  { path: 'select-location', component: SelectLocationPage },
  { path: 'checkout', component: CheckoutPage },
  
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'all-categories',
    loadChildren: () => import('./all-categories/all-categories.module').then( m => m.AllCategoriesPageModule)
  },
  {
    path: 'product-detail',
    loadChildren: () => import('./product-detail/product-detail.module').then( m => m.ProductDetailPageModule)
  },
  {
    path: 'compelte-profile',
    loadChildren: () => import('./compelte-profile/compelte-profile.module').then( m => m.CompelteProfilePageModule)
  },
  {
    path: 'my-account',
    loadChildren: () => import('./my-account/my-account.module').then( m => m.MyAccountPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./settings/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'edit-address',
    loadChildren: () => import('./edit-address/edit-address.module').then( m => m.EditAddressPageModule)
  },
  {
    path: 'whishlist',
    loadChildren: () => import('./settings/whishlist/whishlist.module').then( m => m.WhishlistPageModule)
  },
 
  {
    path: 'sub-categories',
    loadChildren: () => import('./sub-categories/sub-categories.module').then( m => m.SubCategoriesPageModule)
  },
  {
    path: 'view-cart',
    loadChildren: () => import('./view-cart/view-cart.module').then( m => m.ViewCartPageModule)
  },
  {
    path: 'final-checkout',
    loadChildren: () => import('./final-checkout/final-checkout.module').then( m => m.FinalCheckoutPageModule)
  },
  {
    path: 'thank-you',
    loadChildren: () => import('./thank-you/thank-you.module').then( m => m.ThankYouPageModule)
  },
 
  {
    path: 'store-products',
    loadChildren: () => import('./store-products/store-products.module').then( m => m.StoreProductsPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./settings/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./settings/orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'new-pick-drop',
    loadChildren: () => import('./new-pick-drop/new-pick-drop.module').then( m => m.NewPickDropPageModule)
  },
  {
    path: 'view-order-details',
    loadChildren: () => import('./view-order-details/view-order-details.module').then( m => m.ViewOrderDetailsPageModule)
  },
  {
    path: 'all-address',
    loadChildren: () => import('./settings/all-address/all-address.module').then( m => m.AllAddressPageModule)
  },
  {
    path: 'bookmarks',
    loadChildren: () => import('./settings/bookmarks/bookmarks.module').then( m => m.BookmarksPageModule)
  },
  {
    path: 'faqs',
    loadChildren: () => import('./settings/faqs/faqs.module').then( m => m.FAQsPageModule)
  },
  {
    path: 'terms-and-condition',
    loadChildren: () => import('./settings/terms-and-condition/terms-and-condition.module').then( m => m.TermsAndConditionPageModule)
  },
  {
    path: 'privacy',
    loadChildren: () => import('./settings/privacy/privacy.module').then( m => m.PrivacyPageModule)
  },
  {
    path: 'about-us',
    loadChildren: () => import('./settings/about-us/about-us.module').then( m => m.AboutUsPageModule)
  },

 
  

// No AuthGuard needed
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
