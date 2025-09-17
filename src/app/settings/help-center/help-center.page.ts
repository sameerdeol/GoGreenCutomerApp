import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonHeaderComponent } from 'src/app/components/common-header/common-header.component';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.page.html',
  styleUrls: ['./help-center.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CommonHeaderComponent]
})
export class HelpCenterPage implements OnInit {

  queryData = {
    type: '',
    productName: '',
    orderId: '',
    subject: '',
    priority: 'medium',
    description: '',
    email: '',
    phone: ''
  };

  selectedFile: File | null = null;
  isSubmitting: boolean = false;
  userId: string = '';
  emailError: boolean = false;
  emailErrorMessage: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private apiService: ApiserviceService,
    private storage: Storage
  ) { }

  async ngOnInit() {
    await this.storage.create();
    this.userId = await this.storage.get('user_id') || '';
    
    // Pre-fill email if user is logged in
    const userEmail = await this.storage.get('user_email');
    if (userEmail) {
      this.queryData.email = userEmail;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.presentToast('File size should be less than 5MB', 'warning');
        // Reset the input value to allow re-selection
        event.target.value = '';
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.presentToast('Please select an image file', 'warning');
        // Reset the input value to allow re-selection
        event.target.value = '';
        return;
      }
      
      this.selectedFile = file;
    }
  }

  triggerFileUpload() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      // Reset the input value to allow re-selection of the same file
      fileInput.value = '';
      fileInput.click();
    }
  }

  async submitQuery() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('user_id', this.userId);
      formData.append('query_type', this.queryData.type);
      formData.append('subject', this.queryData.subject);
      formData.append('description', this.queryData.description);
      formData.append('priority', 'medium'); // Default priority since priority section was removed
      formData.append('email', this.queryData.email);
      formData.append('phone', this.queryData.phone || '');
      formData.append('product_name', this.queryData.productName || '');
      formData.append('order_id', this.queryData.orderId);
      
      if (this.selectedFile) {
        formData.append('attachment', this.selectedFile);
      }

      // API payload data
      const apiData = {
        user_id: this.userId,
        query_type: this.queryData.type,
        subject: this.queryData.subject,
        description: this.queryData.description,
        priority: 'medium',
        email: this.queryData.email,
        phone: this.queryData.phone || '',
        product_name: this.queryData.productName || '',
        order_id: this.queryData.orderId,
        has_attachment: !!this.selectedFile,
        file_info: this.selectedFile ? {
          name: this.selectedFile.name,
          size: this.selectedFile.size,
          type: this.selectedFile.type
        } : null,
        timestamp: new Date().toISOString()
      };
      
      console.log('API Data:', apiData);

      // Send email notification to admin
      await this.sendAdminNotification();

      // Submit to API
      const response = await this.apiService.submitHelpQuery(formData).toPromise();
      
      if (response && response.success) {
        await this.presentSuccessAlert();
        this.resetForm();
      } else {
        throw new Error('Failed to submit query');
      }
      
    } catch (error) {
      await this.presentToast('Failed to submit query. Please try again.', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  validateEmail(event: any) {
    const email = event.target.value;
    this.queryData.email = email;
    
    if (!email) {
      this.emailError = false;
      this.emailErrorMessage = '';
      return;
    }
    
    // Comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      this.emailError = true;
      
      if (!email.includes('@')) {
        this.emailErrorMessage = 'Email must contain @ symbol';
      } else if (!email.includes('.')) {
        this.emailErrorMessage = 'Email must contain a domain (e.g., .com)';
      } else if (email.indexOf('@') > email.lastIndexOf('.')) {
        this.emailErrorMessage = 'Invalid email format';
      } else if (email.split('@').length !== 2) {
        this.emailErrorMessage = 'Email can only contain one @ symbol';
      } else if (email.startsWith('.') || email.endsWith('.')) {
        this.emailErrorMessage = 'Email cannot start or end with a dot';
      } else if (email.includes('..')) {
        this.emailErrorMessage = 'Email cannot contain consecutive dots';
      } else {
        this.emailErrorMessage = 'Please enter a valid email address';
      }
    } else {
      this.emailError = false;
      this.emailErrorMessage = '';
    }
  }

  validateForm(): boolean {
    if (!this.queryData.type) {
      this.presentToast('Please select a query type', 'warning');
      return false;
    }
    
    if (!this.queryData.orderId.trim()) {
      this.presentToast('Please enter your order ID', 'warning');
      return false;
    }
    
    if (!this.queryData.subject.trim()) {
      this.presentToast('Please enter a subject', 'warning');
      return false;
    }
    
    if (!this.queryData.description.trim()) {
      this.presentToast('Please provide a detailed description', 'warning');
      return false;
    }
    
    if (!this.queryData.email.trim()) {
      this.presentToast('Please enter your email address', 'warning');
      return false;
    }
    
    if (this.emailError) {
      this.presentToast('Please enter a valid email address', 'warning');
      return false;
    }
    
    return true;
  }

  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Query Submitted Successfully!',
      message: 'Thank you for contacting us. We have received your query and will get back to you within 24-48 hours.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.router.navigate(['/my-account']);
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  resetForm() {
    this.queryData = {
      type: '',
      productName: '',
      orderId: '',
      subject: '',
      priority: 'medium',
      description: '',
      email: this.queryData.email, // Keep email
      phone: ''
    };
    this.selectedFile = null;
    // Reset the file input value
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  navigateToFAQ(category: string) {
    // Navigate to FAQ page with specific category
    this.router.navigate(['/faqs'], { queryParams: { category: category } });
  }

  selectQueryType(type: string) {
    this.queryData.type = type;
  }

  selectPriority(priority: string) {
    this.queryData.priority = priority;
  }

  removeFile() {
    this.selectedFile = null;
    // Reset the file input value to allow re-selection of the same file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async sendAdminNotification() {
    try {
      // Prepare email data for admin notification
      const emailData = {
        to: 'admin@gogreen.com', // Replace with actual admin email
        subject: `New Help Center Query: ${this.queryData.subject}`,
        template: 'help-center-notification',
        data: {
          queryType: this.queryData.type,
          subject: this.queryData.subject,
          description: this.queryData.description,
          priority: 'medium',
          userEmail: this.queryData.email,
          userPhone: this.queryData.phone,
          productName: this.queryData.productName,
          orderId: this.queryData.orderId,
          userId: this.userId,
          timestamp: new Date().toISOString(),
          hasAttachment: !!this.selectedFile
        }
      };


      // In a real implementation, you would call an email service API
      // For now, we'll just log the email data
      // await this.apiService.sendAdminEmail(emailData).toPromise();
      
    } catch (error) {
      // Don't throw error here as it shouldn't block the main query submission
    }
  }
}
