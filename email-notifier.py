import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys
def send_email(to_email, subject, message):
    # Gmail SMTP server configuration
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587  # TLS port

    # Your Gmail email address and password (make sure to use an app password if enabled 2-factor authentication)
    sender_email = 'kumarsaarthak916@gmail.com'
    sender_password = 'odog ccuq mxzz tveo'

    # Create a MIMEText object to represent the email content
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = subject

    # Attach the email body (plain text)
    msg.attach(MIMEText(message, 'plain'))

    try:
        # Establish a secure connection with the SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()

        # Login to your Gmail account
        server.login(sender_email, sender_password)

        # Send the email
        server.sendmail(sender_email, to_email, msg.as_string())

        # Close the SMTP server connection
        server.quit()

        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

if __name__ == "__main__":
    # Example usage:
    if len(sys.argv) < 4:
        print("Usage: python email-notifier.py <to_email> <subject> <message>")
        sys.exit(1)

    to_email = sys.argv[1]
    subject = sys.argv[2]
    message = sys.argv[3]
    
    if send_email(to_email, subject, message):
        print("Email sent successfully")
    else:
        print("Email sending failed")
