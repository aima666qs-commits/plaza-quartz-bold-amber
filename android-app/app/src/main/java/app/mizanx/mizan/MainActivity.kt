package app.mizanx.mizan

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Ink = Color(0xFF04100C)
private val Card = Color(0xFF0C1C16)
private val Gold = Color(0xFFD4A853)
private val Cream = Color(0xFFF3EDE2)
private val Mute = Color(0xFF9AAB9F)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MizanApp() }
    }
}

private enum class Tab(val label: String) { Home("Главная"), Zakat("Закят"), Quran("Коран"), Hisn("Хисн"), Learn("Учить") }

@Composable
private fun MizanApp() {
    var tab by rememberSaveable { mutableIntStateOf(0) }
    val current = Tab.entries[tab]
    Scaffold(
        containerColor = Ink,
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF07140F)) {
                Tab.entries.forEachIndexed { i, t ->
                    NavigationBarItem(
                        selected = tab == i,
                        onClick = { tab = i },
                        label = { Text(t.label, fontSize = 11.sp) },
                        icon = {},
                        colors = NavigationBarItemDefaults.colors(
                            selectedTextColor = Gold,
                            unselectedTextColor = Mute,
                            indicatorColor = Color(0xFF163028)
                        )
                    )
                }
            }
        }
    ) { pad ->
        Column(Modifier.fillMaxSize().padding(pad).padding(horizontal = 20.dp).verticalScroll(rememberScrollState())) {
            Spacer(Modifier.height(18.dp))
            Text("МИЗАН", color = Gold, fontSize = 12.sp, letterSpacing = 3.sp)
            Text(current.label, color = Cream, fontSize = 32.sp, fontWeight = FontWeight.SemiBold)
            Text("Шейх · не Айма", color = Mute, fontSize = 13.sp)
            Spacer(Modifier.height(18.dp))
            when (current) {
                Tab.Home -> HomeScreen()
                Tab.Zakat -> ZakatScreen()
                Tab.Quran -> NoteScreen("Коран", "Мусхаф в этом Android-экране не вшит. Полный текст — в веб-Мизане, локальная сверка с alquran.cloud. Здесь только вход, без выдуманных аятов.")
                Tab.Hisn -> NoteScreen("Хисн", "132 главы и 267 дуа живут в веб-снимке. Этот экран не подменяет их сокращением.")
                Tab.Learn -> NoteScreen("Учить", "Шесть путей: арабский вход, Иткан 40 недель, таджвид, хифз Амма, Хисн, смысл Кулиева. «Глубокий» не равен иджазе.")
            }
            Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable
private fun HomeScreen() {
    Panel("Мир тебе") {
        Text("Дом Мизана. Закят считается на соседней вкладке. Коран, Хисн и пути обучения не сжаты в карточки-заглушки с выдуманным текстом.", color = Cream, fontSize = 15.sp, lineHeight = 22.sp)
    }
    Spacer(Modifier.height(12.dp))
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Mini("2,5%", "ставка")
        Mini("85 г", "нисаб золота")
    }
}

@Composable
private fun ZakatScreen() {
    var gold by rememberSaveable { mutableStateOf("") }
    var cash by rememberSaveable { mutableStateOf("") }
    var price by rememberSaveable { mutableStateOf("") }
    val goldG = gold.toDoubleOrNull() ?: 0.0
    val cashN = cash.toDoubleOrNull() ?: 0.0
    val priceN = price.toDoubleOrNull() ?: 0.0
    val wealth = goldG * priceN + cashN
    val nisab = 85.0 * priceN
    val due = if (priceN > 0 && wealth >= nisab) wealth * 0.025 else 0.0
    Panel("Наличные и золото") {
        Field("Золото, г чистого", gold) { gold = it }
        Field("Цена 1 г", price) { price = it }
        Field("Наличные в той же валюте", cash) { cash = it }
    }
    Spacer(Modifier.height(12.dp))
    Panel(if (due > 0) "Закят к выплате" else "Ниже нисаба или нет цены") {
        Text(if (due > 0) format(due) else "0", color = Gold, fontSize = 36.sp, fontWeight = FontWeight.SemiBold)
        Text("Упрощённый контур: 2,5% после нисаба 85 г золота. Не порт engine.ts: нет скота, долгов, мазхабов и хауля. Богословская рецензия не проводилась.", color = Mute, fontSize = 13.sp, lineHeight = 18.sp)
    }
}

@Composable
private fun NoteScreen(title: String, body: String) {
    Panel(title) { Text(body, color = Cream, fontSize = 15.sp, lineHeight = 22.sp) }
}

@Composable
private fun Panel(title: String, body: @Composable () -> Unit) {
    Column(Modifier.fillMaxWidth().background(Card, RoundedCornerShape(18.dp)).padding(16.dp)) {
        Text(title, color = Gold, fontSize = 13.sp, fontWeight = FontWeight.Medium)
        Spacer(Modifier.height(8.dp))
        body()
    }
}

@Composable
private fun Mini(value: String, label: String) {
    Column(Modifier.weight(1f).background(Card, RoundedCornerShape(16.dp)).padding(14.dp)) {
        Text(value, color = Cream, fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
        Text(label, color = Mute, fontSize = 12.sp)
    }
}

@Composable
private fun Field(label: String, value: String, onChange: (String) -> Unit) {
    TextField(
        value = value,
        onValueChange = { onChange(it.filter { c -> c.isDigit() || c == '.' || c == ',' }.replace(',', '.')) },
        label = { Text(label) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        colors = TextFieldDefaults.colors(
            focusedTextColor = Cream,
            unfocusedTextColor = Cream,
            focusedContainerColor = Color.Transparent,
            unfocusedContainerColor = Color.Transparent,
            focusedLabelColor = Gold,
            unfocusedLabelColor = Mute,
            cursorColor = Gold
        ),
        modifier = Modifier.fillMaxWidth()
    )
}

private fun format(n: Double): String = "%,.2f".format(n)
