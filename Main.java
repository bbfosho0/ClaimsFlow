import java.io.*;
import java.util.*;

public class Main {
    private static Scanner scanner = new Scanner(System.in);
    private static List<String> inventory = new ArrayList<>();

    public static void main(String[] args) {
        while (true) {
            showMenu();
            int choice = getUserChoice();
            handleMenuChoice(choice);
        }
    }

    private static void showMenu() {
        System.out.println("Retail Inventory Management System");
        System.out.println("1. Add Item");
        System.out.println("2. View Inventory");
        System.out.println("3. Save Inventory to File");
        System.out.println("4. Load Inventory from File");
        System.out.println("5. Exit");
        System.out.print("Enter your choice: ");
    }

    private static int getUserChoice() {
        int choice = -1;
        try {
            choice = Integer.parseInt(scanner.nextLine());
        } catch (NumberFormatException e) {
            System.out.println("Invalid input. Please enter a number.");
        }
        return choice;
    }

    private static void handleMenuChoice(int choice) {
        switch (choice) {
            case 1:
                addItem();
                break;
            case 2:
                viewInventory();
                break;
            case 3:
                saveInventoryToFile();
                break;
            case 4:
                loadInventoryFromFile();
                break;
            case 5:
                System.out.println("Exiting...");
                System.exit(0);
                break;
            default:
                System.out.println("Invalid choice. Please try again.");
        }
    }

    private static void addItem() {
        System.out.print("Enter item name: ");
        String item = scanner.nextLine();
        inventory.add(item);
        System.out.println("Item added.");
    }

    private static void viewInventory() {
        if (inventory.isEmpty()) {
            System.out.println("Inventory is empty.");
        } else {
            System.out.println("Inventory:");
            for (String item : inventory) {
                System.out.println("- " + item);
            }
        }
    }

    private static void saveInventoryToFile() {
        System.out.print("Enter file name to save inventory: ");
        String fileName = scanner.nextLine();
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName))) {
            for (String item : inventory) {
                writer.write(item);
                writer.newLine();
            }
            System.out.println("Inventory saved to file.");
        } catch (IOException e) {
            System.out.println("Error saving inventory to file: " + e.getMessage());
        }
    }

    private static void loadInventoryFromFile() {
        System.out.print("Enter file name to load inventory: ");
        String fileName = scanner.nextLine();
        try (BufferedReader reader = new BufferedReader(new FileReader(fileName))) {
            String line;
            inventory.clear();
            while ((line = reader.readLine()) != null) {
                inventory.add(line);
            }
            System.out.println("Inventory loaded from file.");
        } catch (FileNotFoundException e) {
            System.out.println("File not found: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("Error reading from file: " + e.getMessage());
        }
    }
}