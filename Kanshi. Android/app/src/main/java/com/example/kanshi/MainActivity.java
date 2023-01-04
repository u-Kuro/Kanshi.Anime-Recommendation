package com.example.kanshi;

import static com.example.kanshi.Utils.*;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.DocumentsContract;
import android.provider.Settings;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.LinearLayout;
import android.widget.Toast;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.util.Objects;

public class MainActivity extends AppCompatActivity  {

    public SharedPreferences prefs;
    private SharedPreferences.Editor prefsEdit;

    private ValueCallback<Uri[]> mUploadMessage;
    private String exportPath;
    private MediaWebView webView;

    private PowerManager.WakeLock wakeLock;
    private NotificationManagerCompat managerCompat;
    private boolean isVisible = true;

    // Activity Results
    final ActivityResultLauncher<Intent> chooseImportFile =
            registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    new ActivityResultCallback<>() {
                        @Override
                        public void onActivityResult(ActivityResult activityResult) {
                            int resultCode = activityResult.getResultCode();
                            Intent intent = activityResult.getData();
                            try {
                                Uri[] result = null;
                                if (null == mUploadMessage || resultCode != RESULT_OK) {
                                    result = new Uri[]{Uri.parse("")};
                                } else {
                                    assert intent != null;
                                    String dataString = intent.getDataString();
                                    if (dataString != null) {
                                        result = new Uri[]{Uri.parse(dataString)};
                                    }
                                }
                                mUploadMessage.onReceiveValue(result);
                                mUploadMessage = null;
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }
            );
    final ActivityResultLauncher<Intent> chooseExportFile =
            registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    new ActivityResultCallback<>() {
                        @Override
                        public void onActivityResult(ActivityResult activityResult) {
                            int resultCode = activityResult.getResultCode();
                            Intent intent = activityResult.getData();
                            try {
                                if (resultCode != RESULT_OK) {
                                    return;
                                }
                                assert intent != null;
                                Uri uri = intent.getData();
                                Uri docUri = DocumentsContract.buildDocumentUriUsingTree(uri,
                                        DocumentsContract.getTreeDocumentId(uri));
                                exportPath = getThisPath(docUri);
                                Toast.makeText(getApplicationContext(), "Export Folder is Selected, you may Export now!", Toast.LENGTH_LONG).show();
                                prefsEdit.putString("savedExportPath", exportPath).apply();
                                webView.loadUrl("javascript:" +
                                        "exportPathIsAvailable=true;" +
                                        "saveJSON(true,'exportPathIsAvailable')"
                                );
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }
            );
    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        // Keep Awake on Lock Screen
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "KeepAwake:");
        wakeLock.acquire(10*60*1000L);
        // Hide Action Bar
        Objects.requireNonNull(getSupportActionBar()).hide();
        // Shared Preference
        prefs = MainActivity.this.getSharedPreferences("com.example.kanshi", Context.MODE_PRIVATE);
        prefsEdit = prefs.edit();
        // Saved Data
        exportPath = prefs.getString("savedExportPath", "");
        // Create WebView App Instance
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // Add WebView on Layout
        ConstraintLayout constraintLayout = findViewById(R.id.activity_main);
        webView = new MediaWebView(MainActivity.this);
        webView.setId(R.id.webView);
        constraintLayout.addView(webView);
        // Add WebView Layout Style
        webView.setLayoutParams(new ConstraintLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
        ));
        ConstraintSet constraintSet = new ConstraintSet();
        constraintSet.clone(constraintLayout);
        constraintSet.connect(webView.getId(),ConstraintSet.BOTTOM,ConstraintSet.PARENT_ID,ConstraintSet.BOTTOM,0);
        constraintSet.connect(webView.getId(),ConstraintSet.END,ConstraintSet.PARENT_ID,ConstraintSet.END,0);
        constraintSet.connect(webView.getId(),ConstraintSet.START,ConstraintSet.PARENT_ID,ConstraintSet.START,0);
        constraintSet.applyTo(constraintLayout);
        // Set WebView Settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setBlockNetworkLoads(false);
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("My Notification","My Notification", NotificationManager.IMPORTANCE_DEFAULT);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
        // Set WebView Configs
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setLongClickable(true);
        webView.setKeepScreenOn(true);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        // Add Bridge to Webview
        webView.addJavascriptInterface(new JSBridge(),"JSBridge");
        webView.setWebChromeClient(new WebChromeClient() {
            // Import
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                try {
                    if (mUploadMessage != null) {
                        mUploadMessage.onReceiveValue(null);
                    }
                    mUploadMessage = filePathCallback;
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT)
                            .addCategory(Intent.CATEGORY_OPENABLE)
                            .setType("application/json");// set MIME type to filter
                    chooseImportFile.launch(i);
                    Toast.makeText(getApplicationContext(), "Please Select your Backup File!", Toast.LENGTH_LONG).show();
                    return true;
                } catch (Exception e){
                    e.printStackTrace();
                    return true;
                }
            }

            // Console Logs for Debugging
            @RequiresApi(api = Build.VERSION_CODES.R)
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                String message = consoleMessage.message();
                int lineNumber = consoleMessage.lineNumber();
                if("WebtoApp: Choose an Export Path".equals(message)){
                    if (!Environment.isExternalStorageManager()) {
                        new AlertDialog.Builder(MainActivity.this)
                                .setTitle("Requires Permission for External Storage")
                                .setMessage("Enable Kanshi. App in the Settings after clicking OK!")
                                .setIcon(android.R.drawable.ic_dialog_alert)
                                .setPositiveButton("OK", (dialogInterface, i) -> {
                                    Uri uri = Uri.parse("package:${BuildConfig.APPLICATION_ID}");
                                    Toast.makeText(getApplicationContext(), "Enable Kanshi. App in here to permit Data Export!", Toast.LENGTH_LONG).show();
                                    startActivity(new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri));
                                })
                                .setNegativeButton("Later", null).show();
                    } else {
                        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                                .addCategory(Intent.CATEGORY_DEFAULT);
                        chooseExportFile.launch(i);
                        Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                    }
                } else if("WebtoApp: List is Updated".equals(message)){
                    if(isVisible){
                        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            v.vibrate(VibrationEffect.createWaveform(new long[] {0, 250, 250, 250},-1));
                        } else {
                            v.vibrate(250);
                        }
                    } else {
                        Intent resultIntent = new Intent(MainActivity.this, MainActivity.class);
                        PendingIntent resultPendingIntent = null;
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                            resultPendingIntent = PendingIntent.getActivity(MainActivity.this, 1, resultIntent, PendingIntent.FLAG_MUTABLE);
                        }
                        NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                                .setContentTitle("Update")
                                .setContentText("Recommendations List has been Updated!")
                                .setSmallIcon(R.drawable.img)
                                .setAutoCancel(true)
                                .setPriority(NotificationCompat.PRIORITY_MAX)
                                .setContentIntent(resultPendingIntent);
                        managerCompat = NotificationManagerCompat.from(MainActivity.this);
                        managerCompat.notify(1, builder.build());
                    }
                } else if("WebtoApp: Update Error".equals(message)){
                    if(isVisible){
                        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            v.vibrate(VibrationEffect.createWaveform(new long[] {0, 250, 250, 250},-1));
                        } else {
                            v.vibrate(250);
                        }
                    } else {
                        Intent resultIntent = new Intent(MainActivity.this, MainActivity.class);
                        PendingIntent resultPendingIntent = null;
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                            resultPendingIntent = PendingIntent.getActivity(MainActivity.this, 1, resultIntent, PendingIntent.FLAG_MUTABLE);
                        }
                        NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                                .setContentTitle("Update")
                                .setContentText("An Error Occurred, List was not been Updated!")
                                .setSmallIcon(R.drawable.img)
                                .setAutoCancel(true)
                                .setPriority(NotificationCompat.PRIORITY_MAX)
                                .setContentIntent(resultPendingIntent);
                        managerCompat = NotificationManagerCompat.from(MainActivity.this);
                        managerCompat.notify(1, builder.build());
                    }
                }
                Log.d("WebConsole",message+"-"+lineNumber);
                return true;
            }
        });
        // Load the Saved/Page
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    // Get Path From MainActivity Context
    public String getThisPath(Uri docUri){
        return getPath(this, docUri);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        isVisible = hasFocus;
        if(hasFocus&&managerCompat!=null){
            managerCompat.cancelAll();
        }
        webView.setKeepScreenOn(true);
        webView.resumeTimers();
        webView.setVisibility(View.VISIBLE);
        webView.onWindowSystemUiVisibilityChanged(View.VISIBLE);
        webView.onWindowVisibilityChanged(View.VISIBLE);
        MainActivity.this.setVisible(true);
        MainActivity.this.requestVisibleBehind(true);
    }

    // Keep WebView Running on Background
    class MediaWebView extends WebView {
        public MediaWebView(Context context) {
            super(context);
        }
        public MediaWebView(Context context, AttributeSet attrs) {
            super(context, attrs);
        }
        public MediaWebView(Context context, AttributeSet attrs, int defStyleAttr) {
            super(context, attrs, defStyleAttr);
        }
        @Override
        public void onWindowSystemUiVisibilityChanged(int visibility) {
            if(visibility != View.GONE) {
                super.resumeTimers();
                super.setVisibility(View.VISIBLE);
                super.setKeepScreenOn(true);
                super.onWindowSystemUiVisibilityChanged(View.VISIBLE);
                super.onWindowVisibilityChanged(View.VISIBLE);
                MainActivity.this.setVisible(true);
                MainActivity.this.requestVisibleBehind(true);
            }
        }
        @Override
        protected void onWindowVisibilityChanged(int visibility) {
            if(visibility != View.GONE) {
                super.resumeTimers();
                super.setVisibility(View.VISIBLE);
                super.setKeepScreenOn(true);
                super.onWindowSystemUiVisibilityChanged(View.VISIBLE);
                super.onWindowVisibilityChanged(View.VISIBLE);
                MainActivity.this.setVisible(true);
                MainActivity.this.requestVisibleBehind(true);
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        wakeLock.release();
    }

    // Native and Webview Connection
    @SuppressWarnings("unused")
    class JSBridge {
        @SuppressWarnings({"unused"})
        BufferedWriter writer;
        File tempFile, file;
        String directoryPath;
        @RequiresApi(api = Build.VERSION_CODES.R)
        @JavascriptInterface
        public void exportJSON(String chunk, int status, String fileName){
            if(status==0) {
                if (!Environment.isExternalStorageManager()) {
                    new AlertDialog.Builder(MainActivity.this)
                            .setTitle("Requires Permission for External Storage")
                            .setMessage("Enable Kanshi. App in the Settings after clicking OK!")
                            .setIcon(android.R.drawable.ic_dialog_alert)
                            .setPositiveButton("OK", (dialogInterface, i) -> {
                                Uri uri = Uri.parse("package:${BuildConfig.APPLICATION_ID}");
                                Toast.makeText(getApplicationContext(), "Enable Kanshi. App in here to permit Data Export!", Toast.LENGTH_LONG).show();
                                startActivity(new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri));
                            })
                            .setNegativeButton("Later", null).show();
                } else {
                    if (new File(exportPath).isDirectory()) {
                        directoryPath = exportPath + File.separator;
                        File directory = new File(directoryPath);
                        boolean dirIsCreated;
                        if (!directory.exists()) {
                            dirIsCreated = directory.mkdirs();
                        } else {
                            dirIsCreated = true;
                        }
                        if (directory.isDirectory() && dirIsCreated) {
                            try {
                                tempFile = new File(directoryPath + "tmp.json");
                                file = new File(directoryPath + fileName);
                                boolean tempFileIsDeleted;
                                if (tempFile.exists()&&!file.exists()) {
                                    tempFileIsDeleted = tempFile.renameTo(file);
                                    if(tempFileIsDeleted){
                                        //noinspection ResultOfMethodCallIgnored
                                        tempFile.createNewFile();
                                    }
                                } else if (tempFile.exists()) {
                                    tempFileIsDeleted = tempFile.delete();
                                    //noinspection ResultOfMethodCallIgnored
                                    tempFile.createNewFile();
                                } else {
                                    tempFileIsDeleted = true;
                                    //noinspection ResultOfMethodCallIgnored
                                    tempFile.createNewFile();
                                }
                                if (tempFileIsDeleted) {
                                    writer = new BufferedWriter(new FileWriter(tempFile, true));
                                } else {
                                    terminateExport();
                                    Toast.makeText(getApplicationContext(), "Error: Temporary data can't be re-written, Please delete tmp.json first in the selected directory!", Toast.LENGTH_LONG).show();
                                }
                            } catch (Exception e) {
                                if(writer!=null){
                                    try {
                                        writer.close();
                                    } catch (Exception e2) {
                                        terminateExport();
                                        Toast.makeText(getApplicationContext(), "Error: An exception occurred initializing the tmp.json file!", Toast.LENGTH_LONG).show();
                                        e.printStackTrace();
                                    }
                                }
                                terminateExport();
                                Toast.makeText(getApplicationContext(), "Error: An exception occurred initializing the tmp.json file!", Toast.LENGTH_LONG).show();
                                e.printStackTrace();
                            }
                        } else if (!dirIsCreated) {
                            Toast.makeText(getApplicationContext(), "Error: Directory can't be found! Please create it first!", Toast.LENGTH_LONG).show();
                        }
                    } else if (!Objects.equals(exportPath, "") && !new File(exportPath).isDirectory()) {
                        String[] tempExportPath = exportPath.split("/");
                        String tempPathName = tempExportPath.length > 1 ?
                                tempExportPath[tempExportPath.length - 2] + "/" +
                                        tempExportPath[tempExportPath.length - 1]
                                : tempExportPath[tempExportPath.length - 1];
                        new AlertDialog.Builder(MainActivity.this)
                                .setTitle("Export Folder is Missing")
                                .setMessage("Folder Directory [" + tempPathName
                                        + "] is missing, Please choose another Folder for Exports...")
                                .setIcon(android.R.drawable.ic_dialog_alert)
                                .setPositiveButton("Choose a Folder", (dialogInterface, x) -> {
                                    Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                                            .addCategory(Intent.CATEGORY_DEFAULT);
                                    chooseExportFile.launch(i);
                                    Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                                })
                                .setNegativeButton("Later", null).show();
                    } else {
                        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                                .addCategory(Intent.CATEGORY_DEFAULT);
                        chooseExportFile.launch(i);
                        Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                    }
                }
            } else if(status==1&&writer!=null) {
                try{
                    writer.write(chunk);
                } catch (Exception e) {
                    try {
                        writer.close();
                    } catch (Exception e2) {
                        terminateExport();
                        Toast.makeText(getApplicationContext(), "Error: An exception occurred while writing to tmp.json file!", Toast.LENGTH_LONG).show();
                        e.printStackTrace();
                    }
                    terminateExport();
                    Toast.makeText(getApplicationContext(), "Error: An exception occurred while writing to tmp.json file!", Toast.LENGTH_LONG).show();
                    e.printStackTrace();
                }
            } else if(status==2&&writer!=null){
                try{
                    writer.write(chunk);
                    writer.close();
                    boolean fileIsDeleted;
                    if (file.exists()) {
                        fileIsDeleted = file.delete();
                        //noinspection ResultOfMethodCallIgnored
                        file.createNewFile();
                    } else {
                        //noinspection ResultOfMethodCallIgnored
                        file.createNewFile();
                        fileIsDeleted = true;
                    }
                    if(fileIsDeleted){
                        boolean renamed = tempFile.renameTo(file);
                        if(renamed){
                            Toast.makeText(getApplicationContext(), "Data was successfully Exported!", Toast.LENGTH_LONG).show();
                        } else {
                            Toast.makeText(getApplicationContext(), "Error: Data file can't be renamed, your original backup is in tmp.json!", Toast.LENGTH_LONG).show();
                        }
                    } else {
                        terminateExport();
                        Toast.makeText(getApplicationContext(), "Error: Data can't be re-written, Please delete it first in the selected directory!", Toast.LENGTH_LONG).show();
                    }
                } catch (Exception e) {
                    try {
                        writer.close();
                    } catch (Exception e2) {
                        terminateExport();
                        Toast.makeText(getApplicationContext(), "Error: An exception occurred in finalizing the exported file, your back-up was saved in tmp.json but is not guaranteed to work!", Toast.LENGTH_LONG).show();
                        e.printStackTrace();
                    }
                    terminateExport();
                    Toast.makeText(getApplicationContext(), "Error: An exception occurred in finalizing the exported file, your back-up was saved in tmp.json but is not guaranteed to work!", Toast.LENGTH_LONG).show();
                    e.printStackTrace();
                }
            }
        }
        @JavascriptInterface
        public void copyToClipBoard(String text) {
            ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText("Copied Text", text);
            clipboard.setPrimaryClip(clip);
        }
    }

    public void terminateExport(){
        webView.post(() -> webView.loadUrl("javascript:" +
            "if(worker7){ worker7.terminate(); }" +
            "dataStatusPrio = false;" +
            "if(!requestIsRunning){" +
            "    dataStatusSpinnerHomeEl.hide();" +
            "    let localeStr = new Date(lastSavedUpdateTime*1000).toLocaleString();" +
            "    dataStatusEl" +
            "        .empty()" +
            "        .append(`<span style=\"white-space:nowrap;\">${lastSavedUpdateTime?`<b class=\"${savedTheme}\" id=\"dataStatusUpdate\">⟳</b> Latest Anilist Update: `+localeStr:`<b class=\"${savedTheme}\" id=\"dataStatusUpdate\">⟳</b> Latest Anilist Update: N/A`}</span>`)" +
            "        .attr(\"data-copy-value\",`Latest Anilist Update: ${lastSavedUpdateTime?localeStr:'N/A'}`);" +
            "}"));
    }
}

