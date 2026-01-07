-- Script de seed pour générer un grand nombre de tâches (5000+)

-- Fonction pour générer des noms de tâches variés
CREATE OR REPLACE FUNCTION random_task_name() RETURNS TEXT AS $$
DECLARE
    prefixes TEXT[] := ARRAY[
        'Développer', 'Tester', 'Corriger', 'Améliorer', 'Refactorer',
        'Optimiser', 'Analyser', 'Documenter', 'Déployer', 'Configurer',
        'Réviser', 'Valider', 'Implémenter', 'Concevoir', 'Planifier'
    ];
    subjects TEXT[] := ARRAY[
        'API REST', 'Interface utilisateur', 'Base de donnees', 'Architecture',
        'Module de paiement', 'Systeme authentification', 'Dashboard',
        'Formulaire de contact', 'Page accueil', 'Profil utilisateur',
        'Notifications', 'Recherche', 'Filtres', 'Export de donnees',
        'Import de fichiers', 'Generation de rapports', 'Cache Redis',
        'Service de mail', 'Logs applicatifs', 'Tests unitaires'
    ];
    prefix TEXT;
    subject TEXT;
BEGIN
    prefix := prefixes[floor(random() * array_length(prefixes, 1) + 1)];
    subject := subjects[floor(random() * array_length(subjects, 1) + 1)];
    RETURN prefix || ' ' || subject;
END;
$$ LANGUAGE plpgsql;

-- Insertion de 8000 tâches avec des donnees variees
-- L'utilisateur avec id=1 est l'utilisateur de test
INSERT INTO tasks (user_id, name, description, status, time_logged, created_at, updated_at)
SELECT 
    1 AS user_id,
    random_task_name() AS name,
    CASE 
        WHEN random() < 0.3 THEN NULL
        ELSE 'Description de la tache numero ' || s || '. Cette tache necessite une attention particuliere.'
    END AS description,
    CASE 
        WHEN random() < 0.4 THEN 'todo'
        WHEN random() < 0.7 THEN 'in_progress'
        ELSE 'done'
    END AS status,
    floor(random() * 28800)::INTEGER AS time_logged, -- 0 a 8 heures en secondes
    CURRENT_TIMESTAMP - (random() * interval '90 days') AS created_at,
    CURRENT_TIMESTAMP - (random() * interval '90 days') AS updated_at
FROM generate_series(1, 8000) AS s;

-- Quelques tâches avec des timers actifs
UPDATE tasks 
SET timer_started_at = CURRENT_TIMESTAMP - (random() * interval '2 hours')
WHERE id IN (SELECT id FROM tasks ORDER BY RANDOM() LIMIT 5);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Seed termine : % taches creees pour utilisateur de test', 
        (SELECT COUNT(*) FROM tasks WHERE user_id = 1);
END $$;
