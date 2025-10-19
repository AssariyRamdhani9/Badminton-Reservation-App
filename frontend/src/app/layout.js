import '../global.css'; 

export const metadata = {
  title: 'Reservation App',
  description: 'Book your court',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}