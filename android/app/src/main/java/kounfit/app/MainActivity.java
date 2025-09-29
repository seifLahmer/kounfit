package kounfit.app;

import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabsIntent;

public class MainActivity extends AppCompatActivity {

    private static final String SITE_URL = "https://fithelath.firebaseapp.com";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Build a Custom Tab
        CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
        builder.setShowTitle(false);           
        builder.enableUrlBarHiding();    // Show the page title
        builder.setToolbarColor(0xFF000000);      // Toolbar color (black)
        CustomTabsIntent customTabsIntent = builder.build();

        // Open the website in the Custom Tab
        customTabsIntent.launchUrl(this, Uri.parse(SITE_URL));

        // Close this activity so the back button works naturally
        finish();
    }
}
