using System;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;

public class HelloWorld
{
    public class DigitalSignature
    {
        public string GetDigitalSignature(string dataToSign)
        {
            string certificate = "test.pfx";
            X509Certificate2 cert = new X509Certificate2(certificate, "Passcode", X509KeyStorageFlags.UserKeySet);
            RSACryptoServiceProvider rsa = (RSACryptoServiceProvider)cert.PrivateKey;

            // Encode the data
            ASCIIEncoding encoding = new ASCIIEncoding();
            byte[] data = encoding.GetBytes(dataToSign);

            // Hash the data
            SHA1Managed sha1 = new SHA1Managed();
            byte[] hash = sha1.ComputeHash(data);

            // Sign the hash
            byte[] digitalSign = rsa.SignHash(hash, CryptoConfig.MapNameToOID("SHA1"));
            string strDigSign = Convert.ToBase64String(digitalSign);

            return strDigSign;
        }
    }

    public static void Main(string[] args)
    {
        DigitalSignature ds = new DigitalSignature();
        string dataToSign = "Hello, World!";
        string sig = ds.GetDigitalSignature(dataToSign);
        Console.WriteLine("Try programiz.pro");
        Console.WriteLine(sig);
    }
}